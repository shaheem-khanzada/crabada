import { sleep } from ".";
import constant from "../common/constant";
import { logError, logInfo, logParams } from "./logger";
import Logs from '../common/logs.json';

let reinforcedTeams = [];
let blockGamesForReinforcement = [];
const reinforceTimeoutMinutes = 27;

export const saveReinforcedTeams = (team) => {
    try {
        const isAlreadyPresent = reinforcedTeams.includes(team.game_id);
        if (!isAlreadyPresent) {
            reinforcedTeams.push(team.game_id);
            console.log("reinforcedTeams", reinforcedTeams);
        }
    } catch (e) {
        logError('saveReinforcedTeams error', e);
    }
};

export const isGameBlocked = (team) => {
    return blockGamesForReinforcement.includes(team.game_id);
};

export const isMiningSafe = (team, gameProcess) => {
    const miliseconds = new Date().getTime() - new Date((team.mine_start_time * 1000)).getTime();
    const minutes = Math.floor((miliseconds / 1000 / 60));
    const { attack } = getGameProcessInfo(gameProcess);
    if ((minutes > 60 && attack === 0)) {
        saveReinforcedTeams(team);
    }
}

const getMinutes = (miliseconds) => {
    const minutes = Math.floor((miliseconds / 1000 / 60) % 60);
    const hours = Math.floor((miliseconds / (1000 * 60 * 60)) % 24);
    if (minutes > 0) {
        return `${logParams(hours)} hours and ${logParams(minutes)} minutes`
    }
};

const getSmallestPauseTime = (allTeams) => {
    const times = allTeams.map((team) => {
        if (team && team?.mine_end_time) {
            return new Date((team.mine_end_time * 1000)).getTime() - new Date().getTime();
        }
    }).filter((e) => e).sort((a, b) => a - b);
    return times.length ? times[0] : (20 * 60000);
}

export const pauseScriptWhenReinforcCompleted = async (allTeams, config) => {
    try {
        const isAllReinforced = allTeams.every((team) => [...reinforcedTeams, ...blockGamesForReinforcement].includes(team.game_id));
        if (isAllReinforced) {
            const miliseconds = config?.PAUSE_MINUTES ? (config?.PAUSE_MINUTES * 60000) : getSmallestPauseTime(allTeams);
            logInfo(Logs.ALL_REINFORCEMENT_COMPLETED + getMinutes(miliseconds));
            await sleep(miliseconds > 0 ? miliseconds : 1000);
        }
    } catch (e) {
        logError('pauseScriptWhenReinforcCompleted error', e);
    }
};

export const removeTeamFromSaveReinforcement = (team) => {
    try {
        const reinforcedIndex = reinforcedTeams.indexOf(team.game_id);
        if (reinforcedIndex > -1) {
            reinforcedTeams.splice(reinforcedIndex, 1);
        }
        const blockIndex = blockGamesForReinforcement.indexOf(team.game_id);
        if (blockIndex > -1) {
            blockGamesForReinforcement.splice(blockIndex, 1);
        }
    } catch (e) {
        logError('removeTeamFromSaveReinforcement error', e);
    }
};

export const blockGameForReinforcement = (team) => {
    try {
        logInfo(Logs.BLOCK_GAME_FOR_REINFORCEMENT + logParams(team.game_id));
        const isAlreadyPresent = blockGamesForReinforcement.includes(team.game_id);
        if (!isAlreadyPresent) {
            blockGamesForReinforcement.push(team.game_id);
        }
    } catch (e) {
        logError('blockGameForReinforcement error', e);
    }
};


const isOutOfTime = (transaction_time) => {
    const time = ((Date.now() / 1000) - transaction_time) * 1000;
    return reinforceTimeoutMinutes > Math.floor((time / 1000 / 60));
};

const getGameProcessInfo = (gameProcess) => {
    let attack = 0;
    let reinforce_attack = 0;
    let reinforce_defense = 0;
    let settle = 0;

    for (let i = 0; i < gameProcess?.length; i++) {
        if (gameProcess[i].action === constant.attack) {
            attack = 1
        };
        if (gameProcess[i].action === constant.reinforceAttack) {
            reinforce_attack++
        }
        if (gameProcess[i].action === constant.reinforceDefense) {
            reinforce_defense++
        }
        if (gameProcess[i].action === constant.settle) {
            settle++
        }
    }
    return { attack, reinforce_attack, reinforce_defense, settle };
}

export const canSendReinforcement = (gameProcess, team, allTeams, config) => {

    if (!gameProcess) {
        return false;
    }

    const { attack, reinforce_attack, reinforce_defense, settle } = getGameProcessInfo(gameProcess)

    if (attack === 1 && reinforce_defense === 0 && settle === 0) {
        const isStillTime = isOutOfTime(gameProcess[1].transaction_time);
        if (!isStillTime) {
            logInfo(Logs.REINFORCEMENT_TIME_OUT);
        }
        return isStillTime;
    }

    if (attack === 1 && reinforce_defense === 1 && reinforce_attack === 1 && settle === 0) {
        const isStillTime = isOutOfTime(gameProcess[3].transaction_time);
        if (!isStillTime) {
            logInfo(Logs.REINFORCEMENT_TIME_OUT);
            saveReinforcedTeams(team);
            pauseScriptWhenReinforcCompleted(allTeams, config);
        }
        return isStillTime;
    }

    if (attack === 1 && reinforce_defense === 1 && settle > 0) {
        saveReinforcedTeams(team);
        pauseScriptWhenReinforcCompleted(allTeams, config);
        return false;
    }

    if (attack === 1 && reinforce_defense === 0 && settle > 0) {
        saveReinforcedTeams(team);
        pauseScriptWhenReinforcCompleted(allTeams, config);
        return false;
    }

    return false;
};