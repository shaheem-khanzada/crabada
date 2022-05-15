"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _path = _interopRequireDefault(require("path"));

var getDirectoryPath = function getDirectoryPath() {
  var isLocal = typeof process.pkg === 'undefined';
  var basePath = isLocal ? process.cwd() : _path["default"].dirname(process.execPath);
  return _path["default"].join(basePath, '/app/');
};

var _default = getDirectoryPath;
exports["default"] = _default;