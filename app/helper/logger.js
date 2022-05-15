"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.logSuccess = exports.logParams = exports.logInfo = exports.logError = void 0;

var _chalk = _interopRequireDefault(require("chalk"));

var _app = _interopRequireDefault(require("../common/app"));

var logInfo = function logInfo(message) {
  if (_app["default"].showDebugApiLogs) {
    var _console;

    for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    (_console = console).log.apply(_console, [_chalk["default"].blue.bold(message + '\n')].concat(args));
  } else {
    console.log(_chalk["default"].blue.bold(message + '\n'));
  }
};

exports.logInfo = logInfo;

var logSuccess = function logSuccess(message) {
  if (_app["default"].showDebugApiLogs) {
    var _console2;

    for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
      args[_key2 - 1] = arguments[_key2];
    }

    (_console2 = console).log.apply(_console2, [_chalk["default"].green.bold(message + '\n')].concat(args));
  } else {
    console.log(_chalk["default"].green.bold(message + '\n'));
  }
};

exports.logSuccess = logSuccess;

var logError = function logError(message) {
  if (_app["default"].showDebugApiLogs) {
    var _console3;

    for (var _len3 = arguments.length, args = new Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
      args[_key3 - 1] = arguments[_key3];
    }

    (_console3 = console).log.apply(_console3, [_chalk["default"].red.bold(message + '\n')].concat(args));
  } else {
    console.log(_chalk["default"].red.bold(message + '\n'));
  }
};

exports.logError = logError;

var logParams = function logParams(message) {
  return _chalk["default"].green.bold(message);
};

exports.logParams = logParams;