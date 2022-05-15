import { networkInterfaces } from 'os';
import { logError } from "./logger";
import Logs from '../common/logs.json';

export const crabsOrderBy = (config) => {
    return config?.CRABS_ORDER_BY === 'time_point' ? 'time_point' : 'battle_point';
}

export const getComparePoints = (crab, config) => {
    return crab[crabsOrderBy(config)];
}

export const getFetchingCrabSetting = (config) => {
    if (config.CRABS_ORDER_BY === 'time_point') {
        return {
            maxLendingPrice: config.MAX_LENDING_PRICE,
            minPoint: config.LENDING_CRAB_MIN_MP || 75
        }
    }
    return {
        maxLendingPrice: config.MAX_LENDING_PRICE,
        minPoint: config.LENDING_CRAB_MIN_BP
    }
}

export const getMacAddress = () => {
    const zeroRegex = /(?:[0]{1,2}[:-]){5}[0]{1,2}/
    try {
        const list = networkInterfaces()
        for (const [key, parts] of Object.entries(list)) {
            if (!parts) continue
            for (const part of parts) {
                if (zeroRegex.test(part.mac) === false) {
                    return part.mac
                }
            }
        }
    } catch (e) {
        logError('getMacAddress error', e);
    }
}

export const compareWithMacAddresses = () => {
    try {
        return JSON.stringify(networkInterfaces(), null, 2).match(/"mac": ".*?"/g).toString().match(/\w\w:\w\w:\w\w:\w\w:\w\w:\w\w/g);
    } catch (e) {
        logError(Logs.MAC_ADDRESS_NOT_FOUND, e);
    }
}

export const sleep = (ms) => {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

export const getHeaders = () => {
    // return {
    //     headers: {
    //         "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.99 Safari/537.36",
    //     }
    // }
}