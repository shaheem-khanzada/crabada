import prompts from 'prompts';
import path from 'path';
import fs from 'fs';
import { getHeapStatistics } from 'v8';
import getDirectoryPath from './getDirectoryPath';
import { logInfo, logParams } from './logger';
require('dotenv').config();

const isAlreadyEncyripted = () => {
    return fs.existsSync(path.join(getDirectoryPath(), '../config.json.enc'));
};

const isEncyriptionAvailable = () => {
    const fileName = '../config.json';
    const isConfigPresent = fs.existsSync(path.join(getDirectoryPath(), fileName));
    if (isConfigPresent) {
        const config = JSON.parse(fs.readFileSync(path.join(getDirectoryPath(), fileName)));
        return config.ENABLE_ENYCRIPTION;
    }
    return false;
}

export default async (cb) => {
    const addPasswordChoice = {
        type: 'password',
        name: 'value',
        message: 'Please create your password for enycription'
    };

    const tellPasswordChoice = {
        type: 'password',
        name: 'value',
        message: 'Need password for decryption'
    };

    let password = ''

    const canEncyript = isEncyriptionAvailable();

    const alreadyEncyripted = isAlreadyEncyripted();

    if (canEncyript) {
        if(alreadyEncyripted){
            if (process?.env?.CHECKING && process?.env?.CHECKING.length) {
                password = process.env.CHECKING;
            } else {
                const response = await prompts(
                    tellPasswordChoice
                );
                password = response.value;
            }
        } else {
            const response = await prompts(
                addPasswordChoice
            );
            password = response.value;
        }
    }

    cb(password)

    const heapSize = (getHeapStatistics().heap_size_limit / 1024 / 1024 / 1024).toFixed(2);
    logInfo(`Heap: is ~${logParams(heapSize)} GB`);
};
