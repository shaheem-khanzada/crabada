import { createDecipheriv } from 'crypto';
import { createReadStream } from 'fs';
import { createUnzip } from 'zlib';
import { logError } from '../helper/logger';
import Logs from '../common/logs.json';

import getCipherKey from './getCipherKey';

function decrypt({ file, pasword }) {
    return new Promise((resolve, reject) => {
        if (!file.endsWith('.enc')) {
            file = file.replace('.json', '.json.enc');
        }
        // First, get the initialization vector from the file.
        const readInitVect = createReadStream(file, { end: 15 });

        let initVect;
        readInitVect.on('data', (chunk) => {
            initVect = chunk;
        });

        readInitVect.on('close', () => {
            const cipherKey = getCipherKey(pasword);
            const readStream = createReadStream(file, { start: 16 });
            const decipher = createDecipheriv('aes256', cipherKey, initVect);
            const unzip = createUnzip();
            let jsonData = '';
            unzip.on('data', (chunk) => {
                jsonData += chunk;
            })

            unzip.on('close', () => {
                resolve(JSON.parse(jsonData));
            })

            unzip.on('error', (error) => {
                logError(Logs.DECRYPTION_FAILED);
                reject(error);
            })

            readStream.on('error', (error) => {
                reject(error);
            })

            decipher.on('error', (error) => {
                reject(error);
            })

            readStream
                .pipe(decipher)
                .pipe(unzip)
        });
    });
}
export default decrypt;