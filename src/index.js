import { ethers } from 'ethers';
import gameABI from './game_abi.json';
import axios from 'axios';
import path from 'path';
import fs from 'fs'
import { logInfo, logSuccess, logError, logParams } from './logger';
import Logs from './logs.json';
import constant from './constant';
import AppConfig from './app';
import { crabsOrderBy, getComparePoints, getFetchingCrabSetting, sleep } from './helper';
import { pauseScriptWhenReinforcCompleted, removeTeamFromSaveReinforcement, saveReinforcedTeams, canSendReinforcement } from './helper/manageReinforcement';
import { checkLicenceValidation } from './helper/manageLicence';

let data = fs.readFileSync(path.join(__dirname, "../config.json"));
let configs = JSON.parse(data);

let carbsLimit = 110;

const wallet = new ethers.Wallet(configs.WALLET_PRIVATE_KEY);
const provider = new ethers.providers.JsonRpcProvider(AppConfig.avalancheBaseUrl);
const account = wallet.connect(provider);
const gameContract = new ethers.Contract(
    AppConfig.contractAddress,
    gameABI,
    account
);

const getTeamInfo = async (walletAddress) => {
    let teams = [];
    try {
        let pageNum = 1;
        while (1) {
            const response = await axios.get(
                `${AppConfig.crabadaBaseUrl}/teams?user_address=${walletAddress}&page=${pageNum}&limit=20`
            );
            const data = response.data
            teams = [...teams, ...(data?.result?.data || [])];
            if (pageNum === data.result.totalPages) {
                break;
            }
            pageNum++;
        }
        return teams;
    } catch (e) {
        logError(Logs.TEAMS_NOT_FOUND);
        return [];
    }
}

const getGameInfo = async (gameId) => {
    try {
        logInfo(Logs.FETCH_GAME_INFO);
        const response = await axios.get(
            `${AppConfig.crabadaBaseUrl}/mine/${gameId}`
        );
        const data = response.data.result;
        logSuccess(Logs.FETCH_GAME_INFO_SUCCESS);
        return data;
    } catch (e) {
        logError(Logs.FETCH_GAME_INFO_ERROR, e);
    }
}

const getCanJoinTeamCrabadas = async (wallet) => {
    try {
        const response = await axios.get(
            `${AppConfig.crabadaBaseUrl}/crabadas/can-join-team?user_address=${wallet}&page=1&limit=20`
        );
        return response.data.result.data.map(x => {
            x.price = 0;
            return x;
        });
    } catch (e) {
        return [];
    }
}

const getLendingCrabadas = async (page, limit) => {
    try {
        const response = await axios.get(
            `${AppConfig.crabadaBaseUrl}/crabadas/lending?orderBy=${crabsOrderBy(configs)}&order=desc&page=${page}&limit=${limit}`
        );
        if (response.data.result.totalPages < page) return false;
        return response.data.result.data;
    } catch (e) {
        return [];
    }
}

const getBestLendingCrabadas = async () => {
    const { maxLendingPrice, minPoint } = getFetchingCrabSetting(configs);
    try {
        let page = 1;
        let finished = false;
        const foundedCrabadas = [];
        const maxPriceBN = ethers.utils.parseUnits(maxLendingPrice.toString(), 18);
        while (true) {
            const currentList = await getLendingCrabadas(page, carbsLimit);
            if (currentList && currentList.length) {
                for (let i = 0; i < currentList.length; i++) {
                    const crab = currentList[i];
                    const comparePoint = getComparePoints(crab, configs);

                    const priceBN = ethers.utils.parseUnits(crab?.price?.toString?.() || '0', 0);
                    if (priceBN.lte(maxPriceBN) && comparePoint >= minPoint) {
                        foundedCrabadas.push(crab);
                    }

                    if ((foundedCrabadas.length >= 2 && (currentList.length - 1) === i)) {
                        finished = true;
                        break;
                    }
                }
                logInfo(`--> Found ${logParams(foundedCrabadas.length)} crabadas`)
                if (finished) break;
                else page++;
            } else {
                break;
            }
        }
        return foundedCrabadas;
    } catch (e) {
        return [];
    }
}

const getCrabs = async (walletAddress) => {
    try {
        switch (configs.LENDING_CRAB_SELECTION) {
            case 1:
                return await getCanJoinTeamCrabadas(walletAddress);
            case 2:
                return await getBestLendingCrabadas();
            case 3:
                const myCrabs = await getCanJoinTeamCrabadas(walletAddress);
                const landingCrabs = await getBestLendingCrabadas();
                return [...landingCrabs, ...myCrabs];
            default:
                break;
        }
    } catch (e) {
        logError(Logs.FETCH_CRABS_ERROR, e);
        return [];
    }
}

const reinforcementTransaction = async (team, walletAddress) => {
    let getCrabesErrorCount = 0;
    let reinforcementTransactionErrorCount = 0;
    try {
        logInfo(Logs.FETCH_CRABS_INFO + logParams(crabsOrderBy(configs)));
        const reinforcementCrabs = await getCrabs(walletAddress);
        if (reinforcementCrabs && reinforcementCrabs.length) {
            for (let i = 0; i < reinforcementCrabs.reverse().length; i++) {
                const crab = reinforcementCrabs[i];
                const rentingCrabPrice = ethers.utils.parseUnits(crab.price.toString(), 0);
                logInfo(
                    `--> Try with crab ${logParams(crab.crabada_id)} - Price: ${logParams(ethers.utils.formatUnits(rentingCrabPrice, 18))} TUS - Battle Point: ${logParams(crab.battle_point)} - Mine Point: ${logParams(crab.time_point)}`
                )
                try {
                    const reinforceTx = await gameContract.reinforceDefense(
                        team.game_id,
                        crab.crabada_id,
                        rentingCrabPrice
                    );
                    logInfo(`${Logs.SENDING_REINFORCEMENTS} hash: ${logParams(reinforceTx.hash)}`);
                    await reinforceTx.wait();
                    await sleep(10000);
                    logSuccess(Logs.REINFORCEMENT_SENT_SUCCESS)
                    break;
                } catch (error) {
                    reinforcementTransactionErrorCount++;
                    logError(Logs.REINFORCEMENT_SENT_ERROR, error);
                    if (reinforcementTransactionErrorCount > 3) {
                        await sleep(2000);
                        break;
                    }
                }
            }
        }
    } catch (e) {
        getCrabesErrorCount++;
        if (getCrabesErrorCount < 4) {
            await reinforcementTransaction(team, walletAddress);
        }
    }
}

const sendReinforcement = async (team, walletAddress, allTeams) => {
    if (team.status === constant.mining) {
        const game = await getGameInfo(team?.game_id);
        let gameFetchErrorCount = 0;
        if (game) {
            if (game?.defense_team_info?.length === 5) {
                logInfo(Logs.REINFORCEMENT_FULL)
                saveReinforcedTeams(team);
                await pauseScriptWhenReinforcCompleted(allTeams);
            } else if (configs.REINFORCE && game && canSendReinforcement(game?.process, team, allTeams)) {
                await reinforcementTransaction(team, walletAddress);
            } else {
                logInfo(Logs.REINFORCEMENT_NOT_NEEDED);
                await sleep(2000);
            }
        } else {
            gameFetchErrorCount = gameFetchErrorCount + 1;
            if (gameFetchErrorCount < 5) {
                await sendReinforcement();
            }
        }
    }
}

const startNewIfFinished = async (team, currentTime) => {
    try {
        if (team.mine_end_time && team.mine_end_time < currentTime && team.status === constant.mining) {
            logInfo(Logs.END_GAME)
            const closeTx = await gameContract.closeGame(team.game_id);
            await closeTx.wait();
            team.mine_end_time = null;
            team.status = constant.available;
            removeTeamFromSaveReinforcement(team);
            await sleep(5000);
            logSuccess(Logs.END_GAME_SUCCESS)
        }
        if (team.status === constant.available) {
            logInfo(Logs.START_GAME)
            const startTx = await gameContract.startGame(team.team_id);
            await startTx.wait();
            team.status = constant.mining;
            logSuccess(Logs.START_GAME_SUCCESS);
            await sleep(10000);
        }
    } catch (e) {
        logError(team.status === constant.available ?
            Logs.START_GAME_ERROR : Logs.END_GAME_ERROR, e
        );
    }
}

const startProcess = async () => {
    logInfo(Logs.START_BOT);
    const walletAddress = await gameContract.signer.getAddress();
    let fetchTeamErrorCount = 0;
    while (true) {
        const teams = await getTeamInfo(walletAddress);
        if (teams && teams?.length) {
            for (let i = 0; i < teams.length; i++) {
                try {
                    const currentTime = Math.floor(Date.now() / 1000);
                    let team = teams[i];
                    logInfo(`--> Team id: ${logParams(team.team_id)} - Status: ${logParams(team.status)}`);
                    await startNewIfFinished(team, currentTime);
                    if (team?.mine_end_time && team?.mine_end_time > currentTime) {
                        await sendReinforcement(team, walletAddress, teams);
                    }
                } catch (e) {
                    logError(Logs.START_MINING_ERROR, e)
                }
            }
        } else {
            logInfo(Logs.SLEEP_FETCH_TEAM);
            fetchTeamErrorCount = fetchTeamErrorCount + 1;
            if (fetchTeamErrorCount >= 5) {
                await sleep(10000);
            }
        }
    }
};

const main = async () => {
    await checkLicenceValidation(configs.LICENCE_KEY);
    startProcess(gameContract, configs.TEAM_LIST);
}

main();
