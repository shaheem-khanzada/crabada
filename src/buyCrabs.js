import { ethers } from 'ethers';
import marketAbi from './contracts/Marketplace.json';
import tusAbi from './contracts/tus_abi.json';
import axios from 'axios';
import path from 'path';
import fs from 'fs'
import { logError, logInfo, logParams, logSuccess } from './helper/logger';
import Logs from './common/logs.json';
import AppConfig from './common/app';
import encryption from './enycription';
import { decriptPrivateKey, removePrivateKeyFromConfig } from './enycription/encryptDecriptPrivateKey';
import { sleep } from './helper';
import getDirectoryPath from './helper/getDirectoryPath';
import cli from './helper/cli';

let totalBought = 0;
let config = null;
let wallet = null;
let provider = null;
let account = null;
let marketPlaceContract = null;
let tusContract = null;

const toFixed = (x) => {
    if (Math.abs(x) < 1.0) {
        var e = parseInt(x.toString().split('e-')[1]);
        if (e) {
            x *= Math.pow(10, e - 1);
            x = '0.' + (new Array(e)).join('0') + x.toString().substring(2);
        }
    } else {
        var e = parseInt(x.toString().split('+')[1]);
        if (e > 20) {
            e -= 20;
            x /= Math.pow(10, e);
            x += (new Array(e + 1)).join('0');
        }
    }
    return x;
};

const numberWithCommas = (n) => {
    return n.toString().replace(/\B(?!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
};

const getMinePoint = (crab) => crab.critical + crab.speed;

const getBattlePoint = (crab) => crab.hp + crab.damage + crab.armor;


const setGoodPrice = (crab) => {
    const normalNumberString = toFixed(crab.price);
    const rentingCrabPrice = ethers.utils.parseUnits(normalNumberString, 0);
    const parseNumber = ethers.utils.formatUnits(rentingCrabPrice, 18)
    return parseInt(parseNumber);
};

const filterBestCrabs = (crab) => {
    if (
        getBattlePoint(crab) >= config.BUY_CRAB_MIN_BP &&
        setGoodPrice(crab) <= config.BUY_CRAB_MAX_PRICE &&
        getMinePoint(crab) >= config.BUY_CRAB_MIN_MP
    ) {
        return true
    }
    return false;
};

const fetchCrabs = async () => {
    try {
        let bestCrabs = [];
        let page = 1;
        while (true) {
            const { data: { result: { data: marketPlaceCrabs, totalPages, totalRecord } } } = await axios.get(`https://api.crabada.com/public/crabada/selling?limit=99&page=${page}&from_breed_count=0&to_breed_count=${config.BUY_CRAB_BREAD_COUNT}&from_legend=0&to_legend=6&from_pure=0&to_pure=6&from_price=0&to_price=2e%2B25&orderBy=price&order=asc`);
            const bestBattlePoints = marketPlaceCrabs.filter(filterBestCrabs);
            const normailizedCrabs = bestBattlePoints.map((crab) => {
                return {
                    id: crab.id,
                    battle_points: getBattlePoint(crab),
                    price: setGoodPrice(crab),
                    amount: numberWithCommas(setGoodPrice(crab)),
                    mine_point: getMinePoint(crab),
                    breed_count: crab.breed_count,
                    order_id: crab.order_id,
                    class_name: crab.class_name
                }
            });
            bestCrabs.push(...normailizedCrabs);
            if (page >= totalPages || marketPlaceCrabs.length >= totalRecord) {
                break;
            }
            page++;
        }
        return bestCrabs.sort((a, b) => a.price - b.price);
    } catch (e) {
        logError('error while fetching crabs', e);
        return [];
    }
}

const getTusBalance = async (walletAddress) => {
    try {
        const balance = await tusContract.balanceOf(walletAddress);
        return parseInt(ethers.utils.formatUnits(balance.toString(), 18));
    } catch (e) {
        console.log('error while fetching tus balance', e);
    }
}

const buyCrabs = async () => {
    logInfo('--> Fetcing wallet address');
    await sleep(2000);
    const walletAddress = await tusContract.signer.getAddress();
    logInfo(`--> Wallet address fetched successfully! ${logParams(walletAddress)}`);
    await sleep(2000);
    logInfo('--> Fetcing TUS balance');
    const balance = await getTusBalance(walletAddress);
    logInfo(`--> Your TUS balance is ${logParams(balance)}`);
    await sleep(2000);
    logInfo(`--> Fetcing best crabs`);
    const crabs = await fetchCrabs();
    logInfo(`--> Found ${logParams(crabs.length)} best crabs`);
    await sleep(2000);

    for (let i = 0; i < crabs.length; i++) {
        const crab = crabs[i];
        try {
            if (balance && balance > crab.price) {
                if (totalBought <= config.BUY_CRAB_COUNT) {
                    await marketPlaceContract.callStatic.buyCard(crab.order_id);
                    const response = await marketPlaceContract.buyCard(crab.order_id);
                    logInfo(`--> You bought crab-${logParams(carb.id)} in amout of TUS: ${logParams(crab.amount)} and the transaction hash is ${logParams(response.hash)}`);
                    await response.wait();
                    totalBought++;
                } else {
                    logInfo(`--> you bought ${logParams(config.BUY_CRAB_COUNT)} crabs, now terminating the script`);
                    process.exit();
                }
            } else {
                logInfo(`--> You don't have enought TUS to make a purchase, needed TUS: ${logParams(crab.amount)} but you have ${logParams(numberWithCommas(balance))} TUS`);
                process.exit();
            }
        } catch (e) {
            logError('error while buying crab', e.reason || e);
        }
    }
};

const initilizeValues = (privateKey) => {
    wallet = new ethers.Wallet(privateKey);
    provider = new ethers.providers.JsonRpcProvider(AppConfig.avalancheBaseUrl);
    account = wallet.connect(provider);
    marketPlaceContract = new ethers.Contract(
        AppConfig.marketPlaceContractAddress,
        marketAbi,
        account
    );
    tusContract = new ethers.Contract(
        AppConfig.tusContractAddress,
        tusAbi,
        account
    );
};

const initilizeScript = async (password) => {
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
            const content = await encryption(path.join(dirname, paths[0]), isAlreadyEncyripted, password);
            removePrivateKeyFromConfig(path.join(dirname, paths[0]))
            initilizeValues(decriptPrivateKey(content.WALLET_PRIVATE_KEY, password))
            !isAlreadyEncyripted && logSuccess(Logs.ENYCRIPTION_SUCCESS);
        } catch {

        }
    } else {
        initilizeValues(config.WALLET_PRIVATE_KEY);
    }
}

const runScript = async () => {
    cli(async (password) => {
        await initilizeScript(password);
        await sleep(5000);
        while (true) {
           try {
            await buyCrabs();
            await sleep(50000);
           } catch {
               // do nothing...
           }
        }
    });
};

runScript();