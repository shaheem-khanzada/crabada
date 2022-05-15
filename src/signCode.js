const signcode = require('signcode');
var path = require('path');
const chalk = require('chalk');

const certificates = [
    {
        cert: path.join(__dirname, 'crabada-certificates', 'crabada-certificate.pem'),
        key: path.join(__dirname, 'crabada-certificates', 'crabada-private-key.pem'),
        overwrite: false,
        path: path.join(__dirname, '../crabada-buy-bot-win.exe'),
        hash: ['sha256'],
        password: 'khanzada5544'
    },
    {
        cert: path.join(__dirname, 'crabada-certificates', 'crabada-certificate.pem'),
        key: path.join(__dirname, 'crabada-certificates', 'crabada-private-key.pem'),
        overwrite: false,
        path: path.join(__dirname, '../crabada-mining-bot-win.exe'),
        hash: ['sha256'],
        password: 'khanzada5544'
    }
];

for (let i = 0; i < certificates.length; i++) {
    const certificate = certificates[i];
    signcode.sign(certificate, (error) => {
        if (error) {
            console.error(chalk.red.bold('Signing failed'), error.message)
        } else {
            console.log(chalk.green.bold(certificate.path + ' is now signed'))
        }
    });

    signcode.verify({ path: certificate.path }, (error) => {
        if (error) {
            console.error(chalk.red.bold('Not signed'), error.message)
        } else {
            console.log(chalk.green.bold(certificate.path + ' is now signed'))
        }
    });
};