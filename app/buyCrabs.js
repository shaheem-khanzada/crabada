"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _ethers = require("ethers");

var _Marketplace = _interopRequireDefault(require("./contracts/Marketplace.json"));

var _tus_abi = _interopRequireDefault(require("./contracts/tus_abi.json"));

var _axios = _interopRequireDefault(require("axios"));

var _path = _interopRequireDefault(require("path"));

var _fs = _interopRequireDefault(require("fs"));

var _logger = require("./helper/logger");

var _logs = _interopRequireDefault(require("./common/logs.json"));

var _app = _interopRequireDefault(require("./common/app"));

var _enycription = _interopRequireDefault(require("./enycription"));

var _encryptDecriptPrivateKey = require("./enycription/encryptDecriptPrivateKey");

var _helper = require("./helper");

var _getDirectoryPath = _interopRequireDefault(require("./helper/getDirectoryPath"));

var _cli = _interopRequireDefault(require("./helper/cli"));

var totalBought = 0;
var config = null;
var wallet = null;
var provider = null;
var account = null;
var marketPlaceContract = null;
var tusContract = null;

var toFixed = function toFixed(x) {
  if (Math.abs(x) < 1.0) {
    var e = parseInt(x.toString().split('e-')[1]);

    if (e) {
      x *= Math.pow(10, e - 1);
      x = '0.' + new Array(e).join('0') + x.toString().substring(2);
    }
  } else {
    var e = parseInt(x.toString().split('+')[1]);

    if (e > 20) {
      e -= 20;
      x /= Math.pow(10, e);
      x += new Array(e + 1).join('0');
    }
  }

  return x;
};

var numberWithCommas = function numberWithCommas(n) {
  return n.toString().replace(/\B(?!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
};

var getMinePoint = function getMinePoint(crab) {
  return crab.critical + crab.speed;
};

var getBattlePoint = function getBattlePoint(crab) {
  return crab.hp + crab.damage + crab.armor;
};

var setGoodPrice = function setGoodPrice(crab) {
  var normalNumberString = toFixed(crab.price);

  var rentingCrabPrice = _ethers.ethers.utils.parseUnits(normalNumberString, 0);

  var parseNumber = _ethers.ethers.utils.formatUnits(rentingCrabPrice, 18);

  return parseInt(parseNumber);
};

var filterBestCrabs = function filterBestCrabs(crab) {
  if (getBattlePoint(crab) >= config.BUY_CRAB_MIN_BP && setGoodPrice(crab) <= config.BUY_CRAB_MAX_PRICE && getMinePoint(crab) >= config.BUY_CRAB_MIN_MP) {
    return true;
  }

  return false;
};

var fetchCrabs = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
    var bestCrabs, page, _yield$axios$get, _yield$axios$get$data, marketPlaceCrabs, totalPages, totalRecord, bestBattlePoints, normailizedCrabs;

    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            bestCrabs = [];
            page = 1;

          case 3:
            if (!true) {
              _context.next = 19;
              break;
            }

            _context.next = 6;
            return _axios["default"].get("https://api.crabada.com/public/crabada/selling?limit=99&page=".concat(page, "&from_breed_count=0&to_breed_count=").concat(config.BUY_CRAB_BREAD_COUNT, "&from_legend=0&to_legend=6&from_pure=0&to_pure=6&from_price=0&to_price=2e%2B25&orderBy=price&order=asc"));

          case 6:
            _yield$axios$get = _context.sent;
            _yield$axios$get$data = _yield$axios$get.data.result;
            marketPlaceCrabs = _yield$axios$get$data.data;
            totalPages = _yield$axios$get$data.totalPages;
            totalRecord = _yield$axios$get$data.totalRecord;
            bestBattlePoints = marketPlaceCrabs.filter(filterBestCrabs);
            normailizedCrabs = bestBattlePoints.map(function (crab) {
              return {
                id: crab.id,
                battle_points: getBattlePoint(crab),
                price: setGoodPrice(crab),
                amount: numberWithCommas(setGoodPrice(crab)),
                mine_point: getMinePoint(crab),
                breed_count: crab.breed_count,
                order_id: crab.order_id,
                class_name: crab.class_name
              };
            });
            bestCrabs.push.apply(bestCrabs, (0, _toConsumableArray2["default"])(normailizedCrabs));

            if (!(page >= totalPages || marketPlaceCrabs.length >= totalRecord)) {
              _context.next = 16;
              break;
            }

            return _context.abrupt("break", 19);

          case 16:
            page++;
            _context.next = 3;
            break;

          case 19:
            return _context.abrupt("return", bestCrabs.sort(function (a, b) {
              return a.price - b.price;
            }));

          case 22:
            _context.prev = 22;
            _context.t0 = _context["catch"](0);
            (0, _logger.logError)('error while fetching crabs', _context.t0);
            return _context.abrupt("return", []);

          case 26:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[0, 22]]);
  }));

  return function fetchCrabs() {
    return _ref.apply(this, arguments);
  };
}();

var getTusBalance = /*#__PURE__*/function () {
  var _ref2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(walletAddress) {
    var balance;
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.prev = 0;
            _context2.next = 3;
            return tusContract.balanceOf(walletAddress);

          case 3:
            balance = _context2.sent;
            return _context2.abrupt("return", parseInt(_ethers.ethers.utils.formatUnits(balance.toString(), 18)));

          case 7:
            _context2.prev = 7;
            _context2.t0 = _context2["catch"](0);
            console.log('error while fetching tus balance', _context2.t0);

          case 10:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, null, [[0, 7]]);
  }));

  return function getTusBalance(_x) {
    return _ref2.apply(this, arguments);
  };
}();

var buyCrabs = /*#__PURE__*/function () {
  var _ref3 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3() {
    var walletAddress, balance, crabs, i, crab, response;
    return _regenerator["default"].wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            (0, _logger.logInfo)('--> Fetcing wallet address');
            _context3.next = 3;
            return (0, _helper.sleep)(2000);

          case 3:
            _context3.next = 5;
            return tusContract.signer.getAddress();

          case 5:
            walletAddress = _context3.sent;
            (0, _logger.logInfo)("--> Wallet address fetched successfully! ".concat((0, _logger.logParams)(walletAddress)));
            _context3.next = 9;
            return (0, _helper.sleep)(2000);

          case 9:
            (0, _logger.logInfo)('--> Fetcing TUS balance');
            _context3.next = 12;
            return getTusBalance(walletAddress);

          case 12:
            balance = _context3.sent;
            (0, _logger.logInfo)("--> Your TUS balance is ".concat((0, _logger.logParams)(balance)));
            _context3.next = 16;
            return (0, _helper.sleep)(2000);

          case 16:
            (0, _logger.logInfo)("--> Fetcing best crabs");
            _context3.next = 19;
            return fetchCrabs();

          case 19:
            crabs = _context3.sent;
            (0, _logger.logInfo)("--> Found ".concat((0, _logger.logParams)(crabs.length), " best crabs"));
            _context3.next = 23;
            return (0, _helper.sleep)(2000);

          case 23:
            i = 0;

          case 24:
            if (!(i < crabs.length)) {
              _context3.next = 54;
              break;
            }

            crab = crabs[i];
            _context3.prev = 26;

            if (!(balance && balance > crab.price)) {
              _context3.next = 44;
              break;
            }

            if (!(totalBought <= config.BUY_CRAB_COUNT)) {
              _context3.next = 40;
              break;
            }

            _context3.next = 31;
            return marketPlaceContract.callStatic.buyCard(crab.order_id);

          case 31:
            _context3.next = 33;
            return marketPlaceContract.buyCard(crab.order_id);

          case 33:
            response = _context3.sent;
            (0, _logger.logInfo)("--> You bought crab-".concat((0, _logger.logParams)(carb.id), " in amout of TUS: ").concat((0, _logger.logParams)(crab.amount), " and the transaction hash is ").concat((0, _logger.logParams)(response.hash)));
            _context3.next = 37;
            return response.wait();

          case 37:
            totalBought++;
            _context3.next = 42;
            break;

          case 40:
            (0, _logger.logInfo)("--> you bought ".concat((0, _logger.logParams)(config.BUY_CRAB_COUNT), " crabs, now terminating the script"));
            process.exit();

          case 42:
            _context3.next = 46;
            break;

          case 44:
            (0, _logger.logInfo)("--> You don't have enought TUS to make a purchase, needed TUS: ".concat((0, _logger.logParams)(crab.amount), " but you have ").concat((0, _logger.logParams)(numberWithCommas(balance)), " TUS"));
            process.exit();

          case 46:
            _context3.next = 51;
            break;

          case 48:
            _context3.prev = 48;
            _context3.t0 = _context3["catch"](26);
            (0, _logger.logError)('error while buying crab', _context3.t0.reason || _context3.t0);

          case 51:
            i++;
            _context3.next = 24;
            break;

          case 54:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, null, [[26, 48]]);
  }));

  return function buyCrabs() {
    return _ref3.apply(this, arguments);
  };
}();

var initilizeValues = function initilizeValues(privateKey) {
  wallet = new _ethers.ethers.Wallet(privateKey);
  provider = new _ethers.ethers.providers.JsonRpcProvider(_app["default"].avalancheBaseUrl);
  account = wallet.connect(provider);
  marketPlaceContract = new _ethers.ethers.Contract(_app["default"].marketPlaceContractAddress, _Marketplace["default"], account);
  tusContract = new _ethers.ethers.Contract(_app["default"].tusContractAddress, _tus_abi["default"], account);
};

var initilizeScript = /*#__PURE__*/function () {
  var _ref4 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee4(password) {
    var _config;

    var dirname, paths, data, isAlreadyEncyripted, content;
    return _regenerator["default"].wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            dirname = (0, _getDirectoryPath["default"])();
            paths = ['../config.json', '../config.json.enc'];
            data = _fs["default"].existsSync(_path["default"].join(dirname, paths[0]));
            isAlreadyEncyripted = _fs["default"].existsSync(_path["default"].join(dirname, paths[1]));

            if (data) {
              config = JSON.parse(_fs["default"].readFileSync(_path["default"].join(dirname, paths[0])));
            }

            if (!((_config = config) !== null && _config !== void 0 && _config.ENABLE_ENYCRIPTION || isAlreadyEncyripted)) {
              _context4.next = 20;
              break;
            }

            _context4.prev = 6;
            !isAlreadyEncyripted && (0, _logger.logSuccess)(_logs["default"].ENYCRIPTION_FILES);
            _context4.next = 10;
            return (0, _enycription["default"])(_path["default"].join(dirname, paths[0]), isAlreadyEncyripted, password);

          case 10:
            content = _context4.sent;
            (0, _encryptDecriptPrivateKey.removePrivateKeyFromConfig)(_path["default"].join(dirname, paths[0]));
            initilizeValues((0, _encryptDecriptPrivateKey.decriptPrivateKey)(content.WALLET_PRIVATE_KEY, password));
            !isAlreadyEncyripted && (0, _logger.logSuccess)(_logs["default"].ENYCRIPTION_SUCCESS);
            _context4.next = 18;
            break;

          case 16:
            _context4.prev = 16;
            _context4.t0 = _context4["catch"](6);

          case 18:
            _context4.next = 21;
            break;

          case 20:
            initilizeValues(config.WALLET_PRIVATE_KEY);

          case 21:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4, null, [[6, 16]]);
  }));

  return function initilizeScript(_x2) {
    return _ref4.apply(this, arguments);
  };
}();

var runScript = /*#__PURE__*/function () {
  var _ref5 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee6() {
    return _regenerator["default"].wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            (0, _cli["default"])( /*#__PURE__*/function () {
              var _ref6 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee5(password) {
                return _regenerator["default"].wrap(function _callee5$(_context5) {
                  while (1) {
                    switch (_context5.prev = _context5.next) {
                      case 0:
                        _context5.next = 2;
                        return initilizeScript(password);

                      case 2:
                        _context5.next = 4;
                        return (0, _helper.sleep)(5000);

                      case 4:
                        if (!true) {
                          _context5.next = 16;
                          break;
                        }

                        _context5.prev = 5;
                        _context5.next = 8;
                        return buyCrabs();

                      case 8:
                        _context5.next = 10;
                        return (0, _helper.sleep)(50000);

                      case 10:
                        _context5.next = 14;
                        break;

                      case 12:
                        _context5.prev = 12;
                        _context5.t0 = _context5["catch"](5);

                      case 14:
                        _context5.next = 4;
                        break;

                      case 16:
                      case "end":
                        return _context5.stop();
                    }
                  }
                }, _callee5, null, [[5, 12]]);
              }));

              return function (_x3) {
                return _ref6.apply(this, arguments);
              };
            }());

          case 1:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6);
  }));

  return function runScript() {
    return _ref5.apply(this, arguments);
  };
}();

runScript();