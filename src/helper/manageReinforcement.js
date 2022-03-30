import { sleep } from ".";
import constant from "../constant";
import { logError, logInfo, logSuccess } from "../logger";
import Logs from '../logs.json';

let reinforcedTeams = [];

export const saveReinforcedTeams = (team) => {
    try {
        const isAlreadyPresent = reinforcedTeams.includes(team.game_id);
        if (!isAlreadyPresent) {
            reinforcedTeams.push(team.game_id);
        }
    } catch (e) {
        logError('saveReinforcedTeams error', e);
    }
};

export const pauseScriptWhenReinforcCompleted = async (allTeams) => {
    try {
        const isAllReinforced = allTeams.every((team) => reinforcedTeams.includes(team.game_id));
        if (isAllReinforced) {
            logSuccess(Logs.ALL_REINFORCEMENT_COMPLETED);
            await sleep(1200000);
        }
    } catch (e) {
        logError('pauseScriptWhenReinforcCompleted error', e);
    }
};

export const removeTeamFromSaveReinforcement = (team) => {
    try {
        const index = reinforcedTeams.indexOf(team.game_id);
        if (index > -1) {
            reinforcedTeams.splice(index, 1);
        }
    } catch (e) {
        logError('removeTeamFromSaveReinforcement error', e);
    }
};


export const canSendReinforcement = async (gameProcess, team, allTeams) => {

    if (!gameProcess) {
        return false;
    }

    let attack = 0;
    let reinforce_attack = 0;
    let reinforce_defense = 0;
    let isGameSettle = gameProcess?.some((p) => p?.action === 'settle');
    let canProceed = false;

    for (let i = 0; i < gameProcess?.length; i++) {
        if (gameProcess[i].action == constant.attack) attack = 1;
        if (gameProcess[i].action == constant.reinforceAttack) reinforce_attack++;
        if (gameProcess[i].action == constant.reinforceDefense) reinforce_defense++;
    }
    if (attack == 1 && reinforce_attack == 0 && reinforce_defense == 0) {
        canProceed = true;
        if (isGameSettle) {
            logInfo('Out of time to send reinforcement');
        }
    }
    if (attack == 1 && reinforce_attack == 1 && reinforce_defense == 1) {
        canProceed = true;
        if (isGameSettle) {
            logInfo('Out of time to send reinforcement');
        }
    }

    if (isGameSettle && canProceed) {
        saveReinforcedTeams(team);
        await pauseScriptWhenReinforcCompleted(allTeams);
    }

    return canProceed && !isGameSettle;
}