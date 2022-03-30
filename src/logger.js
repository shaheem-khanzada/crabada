import chalk from 'chalk';
import AppConfig from './app';

export const logInfo = (message, ...args) => {
    if (AppConfig.showDebugApiLogs) {
        console.log(chalk.blue.bold(message + '\n'), ...args);
    } else {
        console.log(chalk.blue.bold(message + '\n'));
    }
};

export const logSuccess = (message, ...args) => {
    if (AppConfig.showDebugApiLogs) {
        console.log(chalk.green.bold(message + '\n'), ...args);
    } else {
        console.log(chalk.green.bold(message + '\n'));
    }
};

export const logError = (message, ...args) => {
    if (AppConfig.showDebugApiLogs) {
        console.log(chalk.red.bold(message + '\n'), ...args);
    } else {
        console.log(chalk.red.bold(message + '\n'));
    }
};

export const logParams = (message) => {
     return chalk.green.bold(message);
}
