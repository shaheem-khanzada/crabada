import path from 'path';

const getDirectoryPath = () => {
    const isLocal = typeof process.pkg === 'undefined'
    const basePath = isLocal ? process.cwd() : path.dirname(process.execPath);
    return path.join(basePath, '/app/');
};

export default getDirectoryPath;