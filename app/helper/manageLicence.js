"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.checkLicenceValidation = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _googleSpreadsheet = require("google-spreadsheet");

var _ = require(".");

var _app = _interopRequireDefault(require("../app"));

var _constant = _interopRequireDefault(require("../constant"));

var _logger = require("../logger");

var _logs = _interopRequireDefault(require("../logs.json"));

var _client_secret = _interopRequireDefault(require("../client_secret.json"));

var SPREAD_SHEET_ID = _app["default"].spreadSheetId;
var sheetKeys = _app["default"].sheetKeys;

var getLicenceInformation = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(licenceKey) {
    var doc, sheet, allRows, row;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            doc = new _googleSpreadsheet.GoogleSpreadsheet(SPREAD_SHEET_ID);
            _context.next = 4;
            return doc.useServiceAccountAuth(_client_secret["default"]);

          case 4:
            _context.next = 6;
            return doc.loadInfo();

          case 6:
            sheet = doc.sheetsByIndex[0];
            _context.next = 9;
            return sheet.getRows();

          case 9:
            allRows = _context.sent;
            row = allRows.find(function (x) {
              return x[sheetKeys.licenceKey] === licenceKey;
            });

            if (!(row && row[sheetKeys.status] !== _constant["default"].expired)) {
              _context.next = 21;
              break;
            }

            if (!row[sheetKeys.macAddress]) {
              _context.next = 16;
              break;
            }

            return _context.abrupt("return", {
              isValid: (0, _.compareWithMacAddresses)().includes(row[sheetKeys.macAddress]),
              message: _logs["default"].INVALID_MACHINE
            });

          case 16:
            (0, _logger.logInfo)(_logs["default"].LICENCE_ACTIVATION);
            row[sheetKeys.macAddress] = (0, _.getMacAddress)();
            _context.next = 20;
            return row.save();

          case 20:
            return _context.abrupt("return", {
              isValid: true,
              message: _logs["default"].VALID_LICENCE
            });

          case 21:
            return _context.abrupt("return", {
              isValid: false,
              message: row && row[sheetKeys.status] === _constant["default"].expired ? _logs["default"].LICENCE_EXPIRED : _logs["default"].INVALID_LICENCE
            });

          case 24:
            _context.prev = 24;
            _context.t0 = _context["catch"](0);
            (0, _logger.logError)('getLicenceInformation error', _context.t0);

          case 27:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[0, 24]]);
  }));

  return function getLicenceInformation(_x) {
    return _ref.apply(this, arguments);
  };
}();

var checkLicenceValidation = /*#__PURE__*/function () {
  var _ref2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(licenceKey) {
    var result;
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.prev = 0;
            _context2.next = 3;
            return getLicenceInformation(licenceKey);

          case 3:
            result = _context2.sent;
            setInterval(function () {
              checkLicenceValidation();
            }, 3600000);

            if (!(result !== null && result !== void 0 && result.isValid) && result !== null && result !== void 0 && result.message) {
              (0, _logger.logError)(result.message);
              process.exit();
            }

            _context2.next = 11;
            break;

          case 8:
            _context2.prev = 8;
            _context2.t0 = _context2["catch"](0);
            (0, _logger.logError)('checkLicenceValidation error', _context2.t0);

          case 11:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, null, [[0, 8]]);
  }));

  return function checkLicenceValidation(_x2) {
    return _ref2.apply(this, arguments);
  };
}();

exports.checkLicenceValidation = checkLicenceValidation;