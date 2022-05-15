"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.removePrivateKeyFromConfig = exports.encryptPrivateKey = exports.decriptPrivateKey = void 0;

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _crypto = require("crypto");

var _fs = require("fs");

var _getCipherKey = _interopRequireDefault(require("./getCipherKey"));

var algorithm = 'aes-256-ctr';

var readConfigFile = function readConfigFile(filePath) {
  var data = (0, _fs.readFileSync)(filePath);
  var configs = JSON.parse(data);
  return configs;
};

var encryptPrivateKey = function encryptPrivateKey(_ref) {
  var file = _ref.file,
      pasword = _ref.pasword;
  return new Promise(function (resolve, reject) {
    var content = readConfigFile(file);
    var initVect = (0, _crypto.randomBytes)(16);
    var cipher = (0, _crypto.createCipheriv)(algorithm, (0, _getCipherKey["default"])(pasword), initVect);
    var encrypted = Buffer.concat([cipher.update(content.WALLET_PRIVATE_KEY), cipher["final"]()]);
    content.WALLET_PRIVATE_KEY = "".concat(encrypted.toString('hex'), "-").concat(initVect.toString('hex'));
    (0, _fs.writeFile)(file, JSON.stringify(content, null, 2), function (err) {
      if (err) {
        reject(err);
      }

      ;
      resolve();
    });
  });
};

exports.encryptPrivateKey = encryptPrivateKey;

var decriptPrivateKey = function decriptPrivateKey(privaiteKey, pasword) {
  var _privaiteKey$split = privaiteKey.split('-'),
      _privaiteKey$split2 = (0, _slicedToArray2["default"])(_privaiteKey$split, 2),
      content = _privaiteKey$split2[0],
      initVect = _privaiteKey$split2[1];

  var decipher = (0, _crypto.createDecipheriv)(algorithm, (0, _getCipherKey["default"])(pasword), Buffer.from(initVect, 'hex'));
  var decrpyted = Buffer.concat([decipher.update(Buffer.from(content, 'hex')), decipher["final"]()]);
  return decrpyted.toString();
};

exports.decriptPrivateKey = decriptPrivateKey;

var removePrivateKeyFromConfig = function removePrivateKeyFromConfig(file) {
  return new Promise(function (resolve, reject) {
    var content = readConfigFile(file);
    content.WALLET_PRIVATE_KEY = '';
    (0, _fs.writeFile)(file, JSON.stringify(content, null, 2), function (err) {
      if (err) {
        reject(err);
      }

      ;
      resolve();
    });
  });
};

exports.removePrivateKeyFromConfig = removePrivateKeyFromConfig;