import { randomBytes, createCipheriv } from 'crypto';
import { createReadStream, createWriteStream } from 'fs';
import { join } from 'path';
import { createGzip } from 'zlib';

import AppendInitVect from './appendInitVect';
import getCipherKey from './getCipherKey';

function encrypt({ file, pasword }) {
  return new Promise((resolve, reject) => {
    const initVect = randomBytes(16);
    const readStream = createReadStream(file);
    const gzip = createGzip();
    const cipher = createCipheriv('aes256', getCipherKey(pasword), initVect);
    const appendInitVect = new AppendInitVect(initVect);
    const writeStream = createWriteStream(join(file + ".enc"));

    readStream.on('close', () => {
      resolve();
    })

    readStream.on('error', (error) => {
      reject(error)
    })

    readStream
      .pipe(gzip)
      .pipe(cipher)
      .pipe(appendInitVect)
      .pipe(writeStream);
  });
}

export default encrypt;