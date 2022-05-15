import { ethers } from 'ethers';
import gameABI from './contracts/game_abi.json';
import axios from 'axios';
import path from 'path';
import fs from 'fs'
import { logInfo, logSuccess, logError, logParams } from './helper/logger';
import Logs from './common/logs.json';
import constant from './common/constant';
import AppConfig from './common/app';
import { crabsOrderBy, getComparePoints, getFetchingCrabSetting, sleep, getHeaders } from './helper';
import { pauseScriptWhenReinforcCompleted, removeTeamFromSaveReinforcement, saveReinforcedTeams, canSendReinforcement, blockGameForReinforcement, isGameBlocked, isMiningSafe } from './helper/manageReinforcement';
import { checkLicenceValidation } from './helper/manageLicence';
import encryption from './enycription';
import { decriptPrivateKey, removePrivateKeyFromConfig } from './enycription/encryptDecriptPrivateKey';
import getDirectoryPath from './helper/getDirectoryPath';
import encyriptionCli from './helper/cli';

let config = null;
let erc20 = null;

const getTeamInfo = async (walletAddress) => {
    let teams = [];
    try {
        let pageNum = 1;
        while (1) {
            const response = await axios.get(
                `${AppConfig.crabadaBaseUrl}/teams?user_address=${walletAddress}&page=${pageNum}&limit=20`, getHeaders());
            const data = response.data
            teams = [...teams, ...(data?.result?.data || [])];
            if (pageNum === data.result.totalPages) {
                break;
            }
            pageNum++;
        }
        return teams;
    } catch (e) {
        logError(Logs.TEAMS_NOT_FOUND, e);
        return [];
    }
};

const getGameInfo = async (gameId) => {
    try {
        logInfo(Logs.FETCH_GAME_INFO);
        const response = await axios.get(
            `${AppConfig.crabadaBaseUrl}/mine/${gameId}`, getHeaders());
        const data = response.data.result;
        logSuccess(Logs.FETCH_GAME_INFO_SUCCESS);
        return data;
    } catch (e) {
        logError(Logs.FETCH_GAME_INFO_ERROR, e);
    }
};

const getCanJoinTeamCrabadas = async (walletAddress) => {
    try {
        const response = await axios.get(
            `${AppConfig.crabadaBaseUrl}/crabadas/can-join-team?user_address=${walletAddress}&page=1&limit=20`, getHeaders());
        return response.data.result.data.map(x => {
            x.price = 0;
            return x;
        });
    } catch (e) {
        return [];
    }
};

const getLendingCrabadas = async (page, limit = 99) => {
    try {
        const response = await axios.get(
            `${AppConfig.crabadaBaseUrl}/crabadas/lending?orderBy=${crabsOrderBy(config)}&order=desc&page=${page}&limit=${limit}`, getHeaders());
        if (response.data.result.totalPages < page) return false;
        return response.data.result.data;
    } catch (e) {
        return [];
    }
};

const getBestLendingCrabadas = async () => {
    const { maxLendingPrice, minPoint } = getFetchingCrabSetting(config);
    try {
        let page = 1;
        let finished = false;
        const foundedCrabadas = [];
        const maxPriceBN = ethers.utils.parseUnits(maxLendingPrice.toString(), 18);
        while (true) {
            const currentList = await getLendingCrabadas(page);
            if (currentList && currentList.length) {
                for (let i = 0; i < currentList.length; i++) {
                    const crab = currentList[i];
                    const comparePoint = getComparePoints(crab, config);

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
};

const getCrabs = async (walletAddress) => {
    try {
        switch (config.LENDING_CRAB_SELECTION) {
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
};

const reinforcementTransaction = async (team, walletAddress) => {
    let getCrabesErrorCount = 0;
    let reinforcementTransactionErrorCount = 0;
    try {
        logInfo(Logs.FETCH_CRABS_INFO + logParams(crabsOrderBy(config)));
        const reinforcementCrabs = await getCrabs(walletAddress);
        if (reinforcementCrabs && reinforcementCrabs.length) {
            for (let i = 0; i < reinforcementCrabs.reverse().length; i++) {
                const crab = reinforcementCrabs[i];
                const rentingCrabPrice = ethers.utils.parseUnits(crab.price.toString(), 0);
                logInfo(
                    `--> Try with crab ${logParams(crab.crabada_id)} - Price: ${logParams(ethers.utils.formatUnits(rentingCrabPrice, 18))} TUS - Battle Point: ${logParams(crab.battle_point)} - Mine Point: ${logParams(crab.time_point)}`
                )
                logInfo(`Game id: ${team.game_id}`)
                try {
                    await erc20.callStatic.reinforceDefense(
                        team.game_id,
                        crab.crabada_id,
                        rentingCrabPrice,
                        { value: rentingCrabPrice }
                    );

                    logInfo('Sending reinforcement...');

                    const reinforceTx = await erc20.reinforceDefense(
                        team.game_id,
                        crab.crabada_id,
                        rentingCrabPrice,
                        { value: rentingCrabPrice }
                    );
                    logInfo(`${Logs.SENDING_REINFORCEMENTS} hash: ${logParams(reinforceTx.hash)}`);
                    await reinforceTx.wait();
                    logSuccess(Logs.REINFORCEMENT_SENT_SUCCESS)
                    await sleep(5000);
                    break;
                } catch (e) {
                    logError(Logs.REINFORCEMENT_SENT_ERROR, e?.reason || e);
                    if (e.reason && e.reason.includes('GAME:WRONG TURN')) {
                        await sleep(10000);
                        break;
                    }
                    if (e.reason && e.reason.includes('GAME:OUT OF TIME')) {
                        await sleep(10000);
                        break;
                    }

                    reinforcementTransactionErrorCount++;
                    if (reinforcementTransactionErrorCount >= 3) {
                        blockGameForReinforcement(team);
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
};

const sendReinforcement = async (team, walletAddress, allTeams, isLast) => {
    try {
        if (team?.status === constant.mining) {
            const game = await getGameInfo(team?.game_id);
            let gameFetchErrorCount = 0;
            if (game) {
                const isBlocked = isGameBlocked(team);
                if (game?.defense_team_info?.length === 5 || isBlocked) {
                    !isBlocked && logInfo(Logs.REINFORCEMENT_FULL)
                    saveReinforcedTeams(team);
                    await pauseScriptWhenReinforcCompleted(allTeams, config);
                } else if (config.REINFORCE && game && canSendReinforcement(game?.process, team, allTeams, config)) {
                    await reinforcementTransaction(team, walletAddress);
                } else {
                    isMiningSafe(team, game?.process);
                    logInfo(Logs.REINFORCEMENT_NOT_NEEDED);
                    await sleep(isLast ? 60000 : 6000);
                    await pauseScriptWhenReinforcCompleted(allTeams, config);
                }
            } else {
                gameFetchErrorCount = gameFetchErrorCount + 1;
                if (gameFetchErrorCount < 5) {
                    await sendReinforcement(team, walletAddress, allTeams, isLast);
                }
            }
        }
    } catch (e) {
       console.log('Eoor::', e);
    }
};

const startNewIfFinished = async (team, currentTime) => {
    try {
        if (team.mine_end_time && team.mine_end_time < currentTime && team.status === constant.mining) {
            await erc20.callStatic.closeGame(team.game_id);
            logInfo(Logs.END_GAME)
            const closeTx = await erc20.closeGame(team.game_id);
            await closeTx.wait();
            team.mine_end_time = null;
            team.status = constant.available;
            removeTeamFromSaveReinforcement(team);
            await sleep(5000);
            logSuccess(Logs.END_GAME_SUCCESS)
        }
        if (team.status === constant.available) {
            await erc20.callStatic.startGame(team.team_id);
            logInfo(Logs.START_GAME)
            const startTx = await erc20.startGame(team.team_id);
            logInfo(`${Logs.START_GAME} hash: ${logParams(startTx.hash)}`);
            await startTx.wait();
            team.status = constant.mining;
            logSuccess(Logs.START_GAME_SUCCESS);
            await sleep(5000);
        }
    } catch (e) {
        logError(team.status === constant.available ?
            Logs.START_GAME_ERROR : Logs.END_GAME_ERROR, e?.reason || e
        );
    }
};

const startGame = async (walletAddress) => {
    let teams = await getTeamInfo(walletAddress);
    teams = teams.filter((t) => t.crabada_id_1 && t.crabada_id_2 && t.crabada_id_3);
    if (teams && teams?.length) {
        for (let i = 0; i < teams.length; i++) {
            try {
                const currentTime = Math.floor(Date.now() / 1000);
                let team = teams[i];
                logInfo(`--> Team id: ${logParams(team.team_id)} - Status: ${logParams(team.status)}`);
                await startNewIfFinished(team, currentTime);
                if (team?.mine_end_time && team?.mine_end_time > currentTime) {
                    const isLast = ((teams.length - 1) === i);
                    await sendReinforcement(team, walletAddress, teams, isLast);
                }
            } catch (e) {
                console.log('Error ---------->', e);
            }
            if (teams.length < 5) {
                await sleep(10000);
            }
        }
    } else {
        logInfo(Logs.SLEEP_FETCH_TEAM);
        await sleep(60000);
    }
}

const startProcess = async () => {
    logInfo(Logs.START_BOT);
    const walletAddress = await erc20.signer.getAddress();
    while (true) {
       try {
        await startGame(walletAddress);
       } catch (e) {
           console.log('error:::', e);
       }
    }
};

const initilizeValues = (privateKey) => {
    let wallet = new ethers.Wallet(privateKey);
    let provider = new ethers.providers.JsonRpcProvider(AppConfig.avalancheBaseUrl);
    let account = wallet.connect(provider);
    erc20 = new ethers.Contract(
        AppConfig.contractAddress,
        gameABI,
        account
    );
};

const initilizeScript = async (pasword) => {
    const dirname = getDirectoryPath();
    const paths = ['../config.json', '../config.json.enc'];
    let data = fs.existsSync(path.join(dirname, paths[0]));
    let isAlreadyEncyripted = fs.existsSync(path.join(dirname, paths[1]));

    if (data) {
        config = JSON.parse(fs.readFileSync(path.join(dirname, paths[0])));
    }

    if (config?.ENABLE_ENYCRIPTION || isAlreadyEncyripted) {
        try {
            !isAlreadyEncyripted && logSuccess(Logs.ENYCRIPTION_FILES);
            const content = await encryption(path.join(dirname, paths[0]), isAlreadyEncyripted, pasword);
            removePrivateKeyFromConfig(path.join(dirname, paths[0]));
            initilizeValues(decriptPrivateKey(content.WALLET_PRIVATE_KEY, pasword));
            !isAlreadyEncyripted && logSuccess(Logs.ENYCRIPTION_SUCCESS);
        } catch (e) {

        }
    } else {
        initilizeValues(config.WALLET_PRIVATE_KEY)
    }
};

const main = async () => {
    encyriptionCli(async (pasword) => {
       try {
        await initilizeScript(pasword);
        await checkLicenceValidation(config.LICENCE_KEY);
        startProcess();
       } catch (e) {
           console.log("ERROR???", e);
       }
    })
};

main();
