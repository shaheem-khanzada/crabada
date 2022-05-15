"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _crypto = require("crypto");

var _fs = require("fs");

var _path = require("path");

var _zlib = require("zlib");

var _appendInitVect = _interopRequireDefault(require("./appendInitVect"));

var _getCipherKey = _interopRequireDefault(require("./getCipherKey"));

function encrypt(_ref) {
  var file = _ref.file,
      pasword = _ref.pasword;
  return new Promise(function (resolve, reject) {
    var initVect = (0, _crypto.randomBytes)(16);
    var readStream = (0, _fs.createReadStream)(file);
    var gzip = (0, _zlib.createGzip)();
    var cipher = (0, _crypto.createCipheriv)('aes256', (0, _getCipherKey["default"])(pasword), initVect);
    var appendInitVect = new _appendInitVect["default"](initVect);
    var writeStream = (0, _fs.createWriteStream)((0, _path.join)(file + ".enc"));
    readStream.on('close', function () {
      resolve();
    });
    readStream.on('error', function (error) {
      reject(error);
    });
    readStream.pipe(gzip).pipe(cipher).pipe(appendInitVect).pipe(writeStream);
  });
}

var _default = encrypt;
exports["default"] = _default;