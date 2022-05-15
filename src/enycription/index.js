import encrypt from './encrypt';
import decrypt from './decrypt';
import { encryptPrivateKey } from './encryptDecriptPrivateKey';
import { sleep } from '../helper';

const encryption = async (file, isAlreadyEncyripted, pasword) => {
  if (!isAlreadyEncyripted) {
    await encryptPrivateKey({ file, pasword });
    await sleep(5000);
    await encrypt({ file, pasword });
    await sleep(5000);
  }
  return await decrypt({ file, pasword });
};

export default encryption;

