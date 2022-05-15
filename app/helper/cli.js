"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _prompts = _interopRequireDefault(require("prompts"));

var _path = _interopRequireDefault(require("path"));

var _fs = _interopRequireDefault(require("fs"));

var _v = require("v8");

var _getDirectoryPath = _interopRequireDefault(require("./getDirectoryPath"));

var _logger = require("./logger");

require('dotenv').config();

var isAlreadyEncyripted = function isAlreadyEncyripted() {
  return _fs["default"].existsSync(_path["default"].join((0, _getDirectoryPath["default"])(), '../config.json.enc'));
};

var isEncyriptionAvailable = function isEncyriptionAvailable() {
  var fileName = '../config.json';

  var isConfigPresent = _fs["default"].existsSync(_path["default"].join((0, _getDirectoryPath["default"])(), fileName));

  if (isConfigPresent) {
    var config = JSON.parse(_fs["default"].readFileSync(_path["default"].join((0, _getDirectoryPath["default"])(), fileName)));
    return config.ENABLE_ENYCRIPTION;
  }

  return false;
};

var _default = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(cb) {
    var addPasswordChoice, tellPasswordChoice, password, canEncyript, alreadyEncyripted, _process, _process$env, _process2, _process2$env, response, _response, heapSize;

    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            addPasswordChoice = {
              type: 'password',
              name: 'value',
              message: 'Please create your password for enycription'
            };
            tellPasswordChoice = {
              type: 'password',
              name: 'value',
              message: 'Need password for decryption'
            };
            password = '';
            canEncyript = isEncyriptionAvailable();
            alreadyEncyripted = isAlreadyEncyripted();

            if (!canEncyript) {
              _context.next = 21;
              break;
            }

            if (!alreadyEncyripted) {
              _context.next = 17;
              break;
            }

            if (!((_process = process) !== null && _process !== void 0 && (_process$env = _process.env) !== null && _process$env !== void 0 && _process$env.CHECKING && (_process2 = process) !== null && _process2 !== void 0 && (_process2$env = _process2.env) !== null && _process2$env !== void 0 && _process2$env.CHECKING.length)) {
              _context.next = 11;
              break;
            }

            password = process.env.CHECKING;
            _context.next = 15;
            break;

          case 11:
            _context.next = 13;
            return (0, _prompts["default"])(tellPasswordChoice);

          case 13:
            response = _context.sent;
            password = response.value;

          case 15:
            _context.next = 21;
            break;

          case 17:
            _context.next = 19;
            return (0, _prompts["default"])(addPasswordChoice);

          case 19:
            _response = _context.sent;
            password = _response.value;

          case 21:
            cb(password);
            heapSize = ((0, _v.getHeapStatistics)().heap_size_limit / 1024 / 1024 / 1024).toFixed(2);
            (0, _logger.logInfo)("Heap: is ~".concat((0, _logger.logParams)(heapSize), " GB"));

          case 24:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function (_x) {
    return _ref.apply(this, arguments);
  };
}();

exports["default"] = _default;