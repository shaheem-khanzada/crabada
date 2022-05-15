"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _encrypt = _interopRequireDefault(require("./encrypt"));

var _decrypt = _interopRequireDefault(require("./decrypt"));

var _encryptDecriptPrivateKey = require("./encryptDecriptPrivateKey");

var _helper = require("../helper");

var encryption = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(file, isAlreadyEncyripted, pasword) {
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            if (isAlreadyEncyripted) {
              _context.next = 9;
              break;
            }

            _context.next = 3;
            return (0, _encryptDecriptPrivateKey.encryptPrivateKey)({
              file: file,
              pasword: pasword
            });

          case 3:
            _context.next = 5;
            return (0, _helper.sleep)(5000);

          case 5:
            _context.next = 7;
            return (0, _encrypt["default"])({
              file: file,
              pasword: pasword
            });

          case 7:
            _context.next = 9;
            return (0, _helper.sleep)(5000);

          case 9:
            _context.next = 11;
            return (0, _decrypt["default"])({
              file: file,
              pasword: pasword
            });

          case 11:
            return _context.abrupt("return", _context.sent);

          case 12:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function encryption(_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
}();

var _default = encryption;
exports["default"] = _default;