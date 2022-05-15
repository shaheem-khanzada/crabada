import { createHash } from 'crypto';

function getCipherKey(password) {
    return createHash('sha256').update(password).digest();
}

export default getCipherKey;