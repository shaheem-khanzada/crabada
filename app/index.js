"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _ethers = require("ethers");

var _game_abi = _interopRequireDefault(require("./game_abi.json"));

var _axios = _interopRequireDefault(require("axios"));

var _path = _interopRequireDefault(require("path"));

var _fs = _interopRequireDefault(require("fs"));

var _logger = require("./logger");

var _logs = _interopRequireDefault(require("./logs.json"));

var _constant = _interopRequireDefault(require("./constant"));

var _app = _interopRequireDefault(require("./app"));

var _helper = require("./helper");

var _manageReinforcement = require("./helper/manageReinforcement");

var _manageLicence = require("./helper/manageLicence");

var data = _fs["default"].readFileSync(_path["default"].join(__dirname, "../config.json"));

var configs = JSON.parse(data);
var carbsLimit = 110;
var wallet = new _ethers.ethers.Wallet(configs.WALLET_PRIVATE_KEY);
var provider = new _ethers.ethers.providers.JsonRpcProvider(_app["default"].avalancheBaseUrl);
var account = wallet.connect(provider);
var gameContract = new _ethers.ethers.Contract(_app["default"].contractAddress, _game_abi["default"], account);

var getTeamInfo = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(walletAddress) {
    var teams, pageNum, _data$result, response, _data;

    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            teams = [];
            _context.prev = 1;
            pageNum = 1;

          case 3:
            if (!1) {
              _context.next = 14;
              break;
            }

            _context.next = 6;
            return _axios["default"].get("".concat(_app["default"].crabadaBaseUrl, "/teams?user_address=").concat(walletAddress, "&page=").concat(pageNum, "&limit=20"));

          case 6:
            response = _context.sent;
            _data = response.data;
            teams = [].concat((0, _toConsumableArray2["default"])(teams), (0, _toConsumableArray2["default"])((_data === null || _data === void 0 ? void 0 : (_data$result = _data.result) === null || _data$result === void 0 ? void 0 : _data$result.data) || []));

            if (!(pageNum === _data.result.totalPages)) {
              _context.next = 11;
              break;
            }

            return _context.abrupt("break", 14);

          case 11:
            pageNum++;
            _context.next = 3;
            break;

          case 14:
            return _context.abrupt("return", teams);

          case 17:
            _context.prev = 17;
            _context.t0 = _context["catch"](1);
            (0, _logger.logError)(_logs["default"].TEAMS_NOT_FOUND);
            return _context.abrupt("return", []);

          case 21:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[1, 17]]);
  }));

  return function getTeamInfo(_x) {
    return _ref.apply(this, arguments);
  };
}();

var getGameInfo = /*#__PURE__*/function () {
  var _ref2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(gameId) {
    var response, _data2;

    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.prev = 0;
            (0, _logger.logInfo)(_logs["default"].FETCH_GAME_INFO);
            _context2.next = 4;
            return _axios["default"].get("".concat(_app["default"].crabadaBaseUrl, "/mine/").concat(gameId));

          case 4:
            response = _context2.sent;
            _data2 = response.data.result;
            (0, _logger.logSuccess)(_logs["default"].FETCH_GAME_INFO_SUCCESS);
            return _context2.abrupt("return", _data2);

          case 10:
            _context2.prev = 10;
            _context2.t0 = _context2["catch"](0);
            (0, _logger.logError)(_logs["default"].FETCH_GAME_INFO_ERROR, _context2.t0);

          case 13:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, null, [[0, 10]]);
  }));

  return function getGameInfo(_x2) {
    return _ref2.apply(this, arguments);
  };
}();

var getCanJoinTeamCrabadas = /*#__PURE__*/function () {
  var _ref3 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3(wallet) {
    var response;
    return _regenerator["default"].wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.prev = 0;
            _context3.next = 3;
            return _axios["default"].get("".concat(_app["default"].crabadaBaseUrl, "/crabadas/can-join-team?user_address=").concat(wallet, "&page=1&limit=20"));

          case 3:
            response = _context3.sent;
            return _context3.abrupt("return", response.data.result.data.map(function (x) {
              x.price = 0;
              return x;
            }));

          case 7:
            _context3.prev = 7;
            _context3.t0 = _context3["catch"](0);
            return _context3.abrupt("return", []);

          case 10:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, null, [[0, 7]]);
  }));

  return function getCanJoinTeamCrabadas(_x3) {
    return _ref3.apply(this, arguments);
  };
}();

var getLendingCrabadas = /*#__PURE__*/function () {
  var _ref4 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee4(page, limit) {
    var response;
    return _regenerator["default"].wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            _context4.prev = 0;
            _context4.next = 3;
            return _axios["default"].get("".concat(_app["default"].crabadaBaseUrl, "/crabadas/lending?orderBy=").concat((0, _helper.crabsOrderBy)(configs), "&order=desc&page=").concat(page, "&limit=").concat(limit));

          case 3:
            response = _context4.sent;

            if (!(response.data.result.totalPages < page)) {
              _context4.next = 6;
              break;
            }

            return _context4.abrupt("return", false);

          case 6:
            return _context4.abrupt("return", response.data.result.data);

          case 9:
            _context4.prev = 9;
            _context4.t0 = _context4["catch"](0);
            return _context4.abrupt("return", []);

          case 12:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4, null, [[0, 9]]);
  }));

  return function getLendingCrabadas(_x4, _x5) {
    return _ref4.apply(this, arguments);
  };
}();

var getBestLendingCrabadas = /*#__PURE__*/function () {
  var _ref5 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee5() {
    var _getFetchingCrabSetti, maxLendingPrice, minPoint, page, finished, foundedCrabadas, maxPriceBN, currentList, i, _crab$price, _crab$price$toString, crab, comparePoint, priceBN;

    return _regenerator["default"].wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            _getFetchingCrabSetti = (0, _helper.getFetchingCrabSetting)(configs), maxLendingPrice = _getFetchingCrabSetti.maxLendingPrice, minPoint = _getFetchingCrabSetti.minPoint;
            _context5.prev = 1;
            page = 1;
            finished = false;
            foundedCrabadas = [];
            maxPriceBN = _ethers.ethers.utils.parseUnits(maxLendingPrice.toString(), 18);

          case 6:
            if (!true) {
              _context5.next = 34;
              break;
            }

            _context5.next = 9;
            return getLendingCrabadas(page, carbsLimit);

          case 9:
            currentList = _context5.sent;

            if (!(currentList && currentList.length)) {
              _context5.next = 31;
              break;
            }

            i = 0;

          case 12:
            if (!(i < currentList.length)) {
              _context5.next = 23;
              break;
            }

            crab = currentList[i];
            comparePoint = (0, _helper.getComparePoints)(crab, configs);
            priceBN = _ethers.ethers.utils.parseUnits((crab === null || crab === void 0 ? void 0 : (_crab$price = crab.price) === null || _crab$price === void 0 ? void 0 : (_crab$price$toString = _crab$price.toString) === null || _crab$price$toString === void 0 ? void 0 : _crab$price$toString.call(_crab$price)) || '0', 0);

            if (priceBN.lte(maxPriceBN) && comparePoint >= minPoint) {
              foundedCrabadas.push(crab);
            }

            if (!(foundedCrabadas.length >= 2 && currentList.length - 1 === i)) {
              _context5.next = 20;
              break;
            }

            finished = true;
            return _context5.abrupt("break", 23);

          case 20:
            i++;
            _context5.next = 12;
            break;

          case 23:
            (0, _logger.logInfo)("--> Found ".concat((0, _logger.logParams)(foundedCrabadas.length), " crabadas"));

            if (!finished) {
              _context5.next = 28;
              break;
            }

            return _context5.abrupt("break", 34);

          case 28:
            page++;

          case 29:
            _context5.next = 32;
            break;

          case 31:
            return _context5.abrupt("break", 34);

          case 32:
            _context5.next = 6;
            break;

          case 34:
            return _context5.abrupt("return", foundedCrabadas);

          case 37:
            _context5.prev = 37;
            _context5.t0 = _context5["catch"](1);
            return _context5.abrupt("return", []);

          case 40:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5, null, [[1, 37]]);
  }));

  return function getBestLendingCrabadas() {
    return _ref5.apply(this, arguments);
  };
}();

var getCrabs = /*#__PURE__*/function () {
  var _ref6 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee6(walletAddress) {
    var myCrabs, landingCrabs;
    return _regenerator["default"].wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            _context6.prev = 0;
            _context6.t0 = configs.LENDING_CRAB_SELECTION;
            _context6.next = _context6.t0 === 1 ? 4 : _context6.t0 === 2 ? 7 : _context6.t0 === 3 ? 10 : 17;
            break;

          case 4:
            _context6.next = 6;
            return getCanJoinTeamCrabadas(walletAddress);

          case 6:
            return _context6.abrupt("return", _context6.sent);

          case 7:
            _context6.next = 9;
            return getBestLendingCrabadas();

          case 9:
            return _context6.abrupt("return", _context6.sent);

          case 10:
            _context6.next = 12;
            return getCanJoinTeamCrabadas(walletAddress);

          case 12:
            myCrabs = _context6.sent;
            _context6.next = 15;
            return getBestLendingCrabadas();

          case 15:
            landingCrabs = _context6.sent;
            return _context6.abrupt("return", [].concat((0, _toConsumableArray2["default"])(landingCrabs), (0, _toConsumableArray2["default"])(myCrabs)));

          case 17:
            return _context6.abrupt("break", 18);

          case 18:
            _context6.next = 24;
            break;

          case 20:
            _context6.prev = 20;
            _context6.t1 = _context6["catch"](0);
            (0, _logger.logError)(_logs["default"].FETCH_CRABS_ERROR, _context6.t1);
            return _context6.abrupt("return", []);

          case 24:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6, null, [[0, 20]]);
  }));

  return function getCrabs(_x6) {
    return _ref6.apply(this, arguments);
  };
}();

var reinforcementTransaction = /*#__PURE__*/function () {
  var _ref7 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee7(team, walletAddress) {
    var getCrabesErrorCount, reinforcementTransactionErrorCount, reinforcementCrabs, i, crab, rentingCrabPrice, reinforceTx;
    return _regenerator["default"].wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            getCrabesErrorCount = 0;
            reinforcementTransactionErrorCount = 0;
            _context7.prev = 2;
            (0, _logger.logInfo)(_logs["default"].FETCH_CRABS_INFO + (0, _logger.logParams)((0, _helper.crabsOrderBy)(configs)));
            _context7.next = 6;
            return getCrabs(walletAddress);

          case 6:
            reinforcementCrabs = _context7.sent;

            if (!(reinforcementCrabs && reinforcementCrabs.length)) {
              _context7.next = 37;
              break;
            }

            i = 0;

          case 9:
            if (!(i < reinforcementCrabs.reverse().length)) {
              _context7.next = 37;
              break;
            }

            crab = reinforcementCrabs[i];
            rentingCrabPrice = _ethers.ethers.utils.parseUnits(crab.price.toString(), 0);
            (0, _logger.logInfo)("--> Try with crab ".concat((0, _logger.logParams)(crab.crabada_id), " - Price: ").concat((0, _logger.logParams)(_ethers.ethers.utils.formatUnits(rentingCrabPrice, 18)), " TUS - Battle Point: ").concat((0, _logger.logParams)(crab.battle_point), " - Mine Point: ").concat((0, _logger.logParams)(crab.time_point)));
            _context7.prev = 13;
            _context7.next = 16;
            return gameContract.reinforceDefense(team.game_id, crab.crabada_id, rentingCrabPrice);

          case 16:
            reinforceTx = _context7.sent;
            (0, _logger.logInfo)("".concat(_logs["default"].SENDING_REINFORCEMENTS, " hash: ").concat((0, _logger.logParams)(reinforceTx.hash)));
            _context7.next = 20;
            return reinforceTx.wait();

          case 20:
            _context7.next = 22;
            return (0, _helper.sleep)(10000);

          case 22:
            (0, _logger.logSuccess)(_logs["default"].REINFORCEMENT_SENT_SUCCESS);
            return _context7.abrupt("break", 37);

          case 26:
            _context7.prev = 26;
            _context7.t0 = _context7["catch"](13);
            reinforcementTransactionErrorCount++;
            (0, _logger.logError)(_logs["default"].REINFORCEMENT_SENT_ERROR, _context7.t0);

            if (!(reinforcementTransactionErrorCount > 3)) {
              _context7.next = 34;
              break;
            }

            _context7.next = 33;
            return (0, _helper.sleep)(2000);

          case 33:
            return _context7.abrupt("break", 37);

          case 34:
            i++;
            _context7.next = 9;
            break;

          case 37:
            _context7.next = 45;
            break;

          case 39:
            _context7.prev = 39;
            _context7.t1 = _context7["catch"](2);
            getCrabesErrorCount++;

            if (!(getCrabesErrorCount < 4)) {
              _context7.next = 45;
              break;
            }

            _context7.next = 45;
            return reinforcementTransaction(team, walletAddress);

          case 45:
          case "end":
            return _context7.stop();
        }
      }
    }, _callee7, null, [[2, 39], [13, 26]]);
  }));

  return function reinforcementTransaction(_x7, _x8) {
    return _ref7.apply(this, arguments);
  };
}();

var sendReinforcement = /*#__PURE__*/function () {
  var _ref8 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee8(team, walletAddress, allTeams) {
    var game, gameFetchErrorCount, _game$defense_team_in;

    return _regenerator["default"].wrap(function _callee8$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            if (!(team.status === _constant["default"].mining)) {
              _context8.next = 27;
              break;
            }

            _context8.next = 3;
            return getGameInfo(team === null || team === void 0 ? void 0 : team.game_id);

          case 3:
            game = _context8.sent;
            gameFetchErrorCount = 0;

            if (!game) {
              _context8.next = 23;
              break;
            }

            if (!((game === null || game === void 0 ? void 0 : (_game$defense_team_in = game.defense_team_info) === null || _game$defense_team_in === void 0 ? void 0 : _game$defense_team_in.length) === 5)) {
              _context8.next = 13;
              break;
            }

            (0, _logger.logInfo)(_logs["default"].REINFORCEMENT_FULL);
            (0, _manageReinforcement.saveReinforcedTeams)(team);
            _context8.next = 11;
            return (0, _manageReinforcement.pauseScriptWhenReinforcCompleted)(allTeams);

          case 11:
            _context8.next = 21;
            break;

          case 13:
            if (!(configs.REINFORCE && game && (0, _manageReinforcement.canSendReinforcement)(game === null || game === void 0 ? void 0 : game.process, team, allTeams))) {
              _context8.next = 18;
              break;
            }

            _context8.next = 16;
            return reinforcementTransaction(team, walletAddress);

          case 16:
            _context8.next = 21;
            break;

          case 18:
            (0, _logger.logInfo)(_logs["default"].REINFORCEMENT_NOT_NEEDED);
            _context8.next = 21;
            return (0, _helper.sleep)(2000);

          case 21:
            _context8.next = 27;
            break;

          case 23:
            gameFetchErrorCount = gameFetchErrorCount + 1;

            if (!(gameFetchErrorCount < 5)) {
              _context8.next = 27;
              break;
            }

            _context8.next = 27;
            return sendReinforcement();

          case 27:
          case "end":
            return _context8.stop();
        }
      }
    }, _callee8);
  }));

  return function sendReinforcement(_x9, _x10, _x11) {
    return _ref8.apply(this, arguments);
  };
}();

var startNewIfFinished = /*#__PURE__*/function () {
  var _ref9 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee9(team, currentTime) {
    var closeTx, startTx;
    return _regenerator["default"].wrap(function _callee9$(_context9) {
      while (1) {
        switch (_context9.prev = _context9.next) {
          case 0:
            _context9.prev = 0;

            if (!(team.mine_end_time && team.mine_end_time < currentTime && team.status === _constant["default"].mining)) {
              _context9.next = 14;
              break;
            }

            (0, _logger.logInfo)(_logs["default"].END_GAME);
            _context9.next = 5;
            return gameContract.closeGame(team.game_id);

          case 5:
            closeTx = _context9.sent;
            _context9.next = 8;
            return closeTx.wait();

          case 8:
            team.mine_end_time = null;
            team.status = _constant["default"].available;
            (0, _manageReinforcement.removeTeamFromSaveReinforcement)(team);
            _context9.next = 13;
            return (0, _helper.sleep)(5000);

          case 13:
            (0, _logger.logSuccess)(_logs["default"].END_GAME_SUCCESS);

          case 14:
            if (!(team.status === _constant["default"].available)) {
              _context9.next = 25;
              break;
            }

            (0, _logger.logInfo)(_logs["default"].START_GAME);
            _context9.next = 18;
            return gameContract.startGame(team.team_id);

          case 18:
            startTx = _context9.sent;
            _context9.next = 21;
            return startTx.wait();

          case 21:
            team.status = _constant["default"].mining;
            (0, _logger.logSuccess)(_logs["default"].START_GAME_SUCCESS);
            _context9.next = 25;
            return (0, _helper.sleep)(10000);

          case 25:
            _context9.next = 30;
            break;

          case 27:
            _context9.prev = 27;
            _context9.t0 = _context9["catch"](0);
            (0, _logger.logError)(team.status === _constant["default"].available ? _logs["default"].START_GAME_ERROR : _logs["default"].END_GAME_ERROR, _context9.t0);

          case 30:
          case "end":
            return _context9.stop();
        }
      }
    }, _callee9, null, [[0, 27]]);
  }));

  return function startNewIfFinished(_x12, _x13) {
    return _ref9.apply(this, arguments);
  };
}();

var startProcess = /*#__PURE__*/function () {
  var _ref10 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee10() {
    var walletAddress, fetchTeamErrorCount, teams, i, currentTime, team;
    return _regenerator["default"].wrap(function _callee10$(_context10) {
      while (1) {
        switch (_context10.prev = _context10.next) {
          case 0:
            (0, _logger.logInfo)(_logs["default"].START_BOT);
            _context10.next = 3;
            return gameContract.signer.getAddress();

          case 3:
            walletAddress = _context10.sent;
            fetchTeamErrorCount = 0;

          case 5:
            if (!true) {
              _context10.next = 38;
              break;
            }

            _context10.next = 8;
            return getTeamInfo(walletAddress);

          case 8:
            teams = _context10.sent;

            if (!(teams && teams !== null && teams !== void 0 && teams.length)) {
              _context10.next = 31;
              break;
            }

            i = 0;

          case 11:
            if (!(i < teams.length)) {
              _context10.next = 29;
              break;
            }

            _context10.prev = 12;
            currentTime = Math.floor(Date.now() / 1000);
            team = teams[i];
            (0, _logger.logInfo)("--> Team id: ".concat((0, _logger.logParams)(team.team_id), " - Status: ").concat((0, _logger.logParams)(team.status)));
            _context10.next = 18;
            return startNewIfFinished(team, currentTime);

          case 18:
            if (!(team !== null && team !== void 0 && team.mine_end_time && (team === null || team === void 0 ? void 0 : team.mine_end_time) > currentTime)) {
              _context10.next = 21;
              break;
            }

            _context10.next = 21;
            return sendReinforcement(team, walletAddress, teams);

          case 21:
            _context10.next = 26;
            break;

          case 23:
            _context10.prev = 23;
            _context10.t0 = _context10["catch"](12);
            (0, _logger.logError)(_logs["default"].START_MINING_ERROR, _context10.t0);

          case 26:
            i++;
            _context10.next = 11;
            break;

          case 29:
            _context10.next = 36;
            break;

          case 31:
            (0, _logger.logInfo)(_logs["default"].SLEEP_FETCH_TEAM);
            fetchTeamErrorCount = fetchTeamErrorCount + 1;

            if (!(fetchTeamErrorCount >= 5)) {
              _context10.next = 36;
              break;
            }

            _context10.next = 36;
            return (0, _helper.sleep)(10000);

          case 36:
            _context10.next = 5;
            break;

          case 38:
          case "end":
            return _context10.stop();
        }
      }
    }, _callee10, null, [[12, 23]]);
  }));

  return function startProcess() {
    return _ref10.apply(this, arguments);
  };
}();

var main = /*#__PURE__*/function () {
  var _ref11 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee11() {
    return _regenerator["default"].wrap(function _callee11$(_context11) {
      while (1) {
        switch (_context11.prev = _context11.next) {
          case 0:
            _context11.next = 2;
            return (0, _manageLicence.checkLicenceValidation)(configs.LICENCE_KEY);

          case 2:
            startProcess(gameContract, configs.TEAM_LIST);

          case 3:
          case "end":
            return _context11.stop();
        }
      }
    }, _callee11);
  }));

  return function main() {
    return _ref11.apply(this, arguments);
  };
}();

main();