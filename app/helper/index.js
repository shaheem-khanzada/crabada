"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sleep = exports.getMacAddress = exports.getHeaders = exports.getFetchingCrabSetting = exports.getComparePoints = exports.crabsOrderBy = exports.compareWithMacAddresses = void 0;

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _os = require("os");

var _logger = require("./logger");

var _logs = _interopRequireDefault(require("../common/logs.json"));

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var crabsOrderBy = function crabsOrderBy(config) {
  return (config === null || config === void 0 ? void 0 : config.CRABS_ORDER_BY) === 'time_point' ? 'time_point' : 'battle_point';
};

exports.crabsOrderBy = crabsOrderBy;

var getComparePoints = function getComparePoints(crab, config) {
  return crab[crabsOrderBy(config)];
};

exports.getComparePoints = getComparePoints;

var getFetchingCrabSetting = function getFetchingCrabSetting(config) {
  if (config.CRABS_ORDER_BY === 'time_point') {
    return {
      maxLendingPrice: config.MAX_LENDING_PRICE,
      minPoint: config.LENDING_CRAB_MIN_MP || 75
    };
  }

  return {
    maxLendingPrice: config.MAX_LENDING_PRICE,
    minPoint: config.LENDING_CRAB_MIN_BP
  };
};

exports.getFetchingCrabSetting = getFetchingCrabSetting;

var getMacAddress = function getMacAddress() {
  var zeroRegex = /(?:[0]{1,2}[:-]){5}[0]{1,2}/;

  try {
    var list = (0, _os.networkInterfaces)();

    for (var _i = 0, _Object$entries = Object.entries(list); _i < _Object$entries.length; _i++) {
      var _Object$entries$_i = (0, _slicedToArray2["default"])(_Object$entries[_i], 2),
          key = _Object$entries$_i[0],
          parts = _Object$entries$_i[1];

      if (!parts) continue;

      var _iterator = _createForOfIteratorHelper(parts),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var part = _step.value;

          if (zeroRegex.test(part.mac) === false) {
            return part.mac;
          }
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
    }
  } catch (e) {
    (0, _logger.logError)('getMacAddress error', e);
  }
};

exports.getMacAddress = getMacAddress;

var compareWithMacAddresses = function compareWithMacAddresses() {
  try {
    return JSON.stringify((0, _os.networkInterfaces)(), null, 2).match(/"mac": ".*?"/g).toString().match(/\w\w:\w\w:\w\w:\w\w:\w\w:\w\w/g);
  } catch (e) {
    (0, _logger.logError)(_logs["default"].MAC_ADDRESS_NOT_FOUND, e);
  }
};

exports.compareWithMacAddresses = compareWithMacAddresses;

var sleep = function sleep(ms) {
  return new Promise(function (resolve) {
    setTimeout(resolve, ms);
  });
};

exports.sleep = sleep;

var getHeaders = function getHeaders() {// return {
  //     headers: {
  //         "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.99 Safari/537.36",
  //     }
  // }
};

exports.getHeaders = getHeaders;