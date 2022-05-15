"use strict";

var signcode = require('signcode');

var path = require('path');

var chalk = require('chalk');

var certificates = [{
  cert: path.join(__dirname, 'crabada-certificates', 'crabada-certificate.pem'),
  key: path.join(__dirname, 'crabada-certificates', 'crabada-private-key.pem'),
  overwrite: false,
  path: path.join(__dirname, '../crabada-buy-bot-win.exe'),
  hash: ['sha256'],
  password: 'khanzada5544'
}, {
  cert: path.join(__dirname, 'crabada-certificates', 'crabada-certificate.pem'),
  key: path.join(__dirname, 'crabada-certificates', 'crabada-private-key.pem'),
  overwrite: false,
  path: path.join(__dirname, '../crabada-mining-bot-win.exe'),
  hash: ['sha256'],
  password: 'khanzada5544'
}];

var _loop = function _loop(i) {
  var certificate = certificates[i];
  signcode.sign(certificate, function (error) {
    if (error) {
      console.error(chalk.red.bold('Signing failed'), error.message);
    } else {
      console.log(chalk.green.bold(certificate.path + ' is now signed'));
    }
  });
  signcode.verify({
    path: certificate.path
  }, function (error) {
    if (error) {
      console.error(chalk.red.bold('Not signed'), error.message);
    } else {
      console.log(chalk.green.bold(certificate.path + ' is now signed'));
    }
  });
};

for (var i = 0; i < certificates.length; i++) {
  _loop(i);
}

;