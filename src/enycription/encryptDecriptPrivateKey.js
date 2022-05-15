import { randomBytes, createCipheriv, createDecipheriv } from 'crypto';
import { readFileSync, writeFile } from 'fs';
import getCipherKey from './getCipherKey';


const algorithm = 'aes-256-ctr';

const readConfigFile = (filePath) => {
  const data = readFileSync(filePath);
  const configs = JSON.parse(data);
  return configs;
}

const encryptPrivateKey = ({ file, pasword }) => {
  return new Promise((resolve, reject) => {
    let content = readConfigFile(file);
    const initVect = randomBytes(16);
    const cipher = createCipheriv(algorithm, getCipherKey(pasword), initVect);
    const encrypted = Buffer.concat([cipher.update(content.WALLET_PRIVATE_KEY), cipher.final()]);
    content.WALLET_PRIVATE_KEY = `${encrypted.toString('hex')}-${initVect.toString('hex')}`;
    writeFile(file, JSON.stringify(content, null, 2), (err) => {
      if (err) {
        reject(err);
      };
      resolve();
    });
  });
}

const decriptPrivateKey = (privaiteKey, pasword) => {
  const [content, initVect] = privaiteKey.split('-');
  const decipher = createDecipheriv(algorithm, getCipherKey(pasword), Buffer.from(initVect, 'hex'));
  const decrpyted = Buffer.concat([decipher.update(Buffer.from(content, 'hex')), decipher.final()]);
  return decrpyted.toString();
}

const removePrivateKeyFromConfig = (file) => {
  return new Promise((resolve, reject) => {
    let content = readConfigFile(file);
    content.WALLET_PRIVATE_KEY = '';
    writeFile(file, JSON.stringify(content, null, 2), (err) => {
      if (err) {
        reject(err);
      };
      resolve();
    });
  });
}

export {
  encryptPrivateKey,
  decriptPrivateKey,
  removePrivateKeyFromConfig
}