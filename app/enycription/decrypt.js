"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _crypto = require("crypto");

var _fs = require("fs");

var _zlib = require("zlib");

var _logger = require("../helper/logger");

var _logs = _interopRequireDefault(require("../common/logs.json"));

var _getCipherKey = _interopRequireDefault(require("./getCipherKey"));

function decrypt(_ref) {
  var file = _ref.file,
      pasword = _ref.pasword;
  return new Promise(function (resolve, reject) {
    if (!file.endsWith('.enc')) {
      file = file.replace('.json', '.json.enc');
    } // First, get the initialization vector from the file.


    var readInitVect = (0, _fs.createReadStream)(file, {
      end: 15
    });
    var initVect;
    readInitVect.on('data', function (chunk) {
      initVect = chunk;
    });
    readInitVect.on('close', function () {
      var cipherKey = (0, _getCipherKey["default"])(pasword);
      var readStream = (0, _fs.createReadStream)(file, {
        start: 16
      });
      var decipher = (0, _crypto.createDecipheriv)('aes256', cipherKey, initVect);
      var unzip = (0, _zlib.createUnzip)();
      var jsonData = '';
      unzip.on('data', function (chunk) {
        jsonData += chunk;
      });
      unzip.on('close', function () {
        resolve(JSON.parse(jsonData));
      });
      unzip.on('error', function (error) {
        (0, _logger.logError)(_logs["default"].DECRYPTION_FAILED);
        reject(error);
      });
      readStream.on('error', function (error) {
        reject(error);
      });
      decipher.on('error', function (error) {
        reject(error);
      });
      readStream.pipe(decipher).pipe(unzip);
    });
  });
}

var _default = decrypt;
exports["default"] = _default;