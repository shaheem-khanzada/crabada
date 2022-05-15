"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.saveReinforcedTeams = exports.removeTeamFromSaveReinforcement = exports.pauseScriptWhenReinforcCompleted = exports.isMiningSafe = exports.isGameBlocked = exports.canSendReinforcement = exports.blockGameForReinforcement = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _ = require(".");

var _constant = _interopRequireDefault(require("../common/constant"));

var _logger = require("./logger");

var _logs = _interopRequireDefault(require("../common/logs.json"));

var reinforcedTeams = [];
var blockGamesForReinforcement = [];
var reinforceTimeoutMinutes = 27;

var saveReinforcedTeams = function saveReinforcedTeams(team) {
  try {
    var isAlreadyPresent = reinforcedTeams.includes(team.game_id);

    if (!isAlreadyPresent) {
      reinforcedTeams.push(team.game_id);
      console.log("reinforcedTeams", reinforcedTeams);
    }
  } catch (e) {
    (0, _logger.logError)('saveReinforcedTeams error', e);
  }
};

exports.saveReinforcedTeams = saveReinforcedTeams;

var isGameBlocked = function isGameBlocked(team) {
  return blockGamesForReinforcement.includes(team.game_id);
};

exports.isGameBlocked = isGameBlocked;

var isMiningSafe = function isMiningSafe(team, gameProcess) {
  var miliseconds = new Date().getTime() - new Date(team.mine_start_time * 1000).getTime();
  var minutes = Math.floor(miliseconds / 1000 / 60);

  var _getGameProcessInfo = getGameProcessInfo(gameProcess),
      attack = _getGameProcessInfo.attack;

  if (minutes > 60 && attack === 0) {
    saveReinforcedTeams(team);
  }
};

exports.isMiningSafe = isMiningSafe;

var getMinutes = function getMinutes(miliseconds) {
  var minutes = Math.floor(miliseconds / 1000 / 60 % 60);
  var hours = Math.floor(miliseconds / (1000 * 60 * 60) % 24);

  if (minutes > 0) {
    return "".concat((0, _logger.logParams)(hours), " hours and ").concat((0, _logger.logParams)(minutes), " minutes");
  }
};

var getSmallestPauseTime = function getSmallestPauseTime(allTeams) {
  var times = allTeams.map(function (team) {
    if (team && team !== null && team !== void 0 && team.mine_end_time) {
      return new Date(team.mine_end_time * 1000).getTime() - new Date().getTime();
    }
  }).filter(function (e) {
    return e;
  }).sort(function (a, b) {
    return a - b;
  });
  return times.length ? times[0] : 20 * 60000;
};

var pauseScriptWhenReinforcCompleted = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(allTeams, config) {
    var isAllReinforced, miliseconds;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            isAllReinforced = allTeams.every(function (team) {
              return [].concat(reinforcedTeams, blockGamesForReinforcement).includes(team.game_id);
            });

            if (!isAllReinforced) {
              _context.next = 7;
              break;
            }

            miliseconds = config !== null && config !== void 0 && config.PAUSE_MINUTES ? (config === null || config === void 0 ? void 0 : config.PAUSE_MINUTES) * 60000 : getSmallestPauseTime(allTeams);
            (0, _logger.logInfo)(_logs["default"].ALL_REINFORCEMENT_COMPLETED + getMinutes(miliseconds));
            _context.next = 7;
            return (0, _.sleep)(miliseconds > 0 ? miliseconds : 1000);

          case 7:
            _context.next = 12;
            break;

          case 9:
            _context.prev = 9;
            _context.t0 = _context["catch"](0);
            (0, _logger.logError)('pauseScriptWhenReinforcCompleted error', _context.t0);

          case 12:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[0, 9]]);
  }));

  return function pauseScriptWhenReinforcCompleted(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();

exports.pauseScriptWhenReinforcCompleted = pauseScriptWhenReinforcCompleted;

var removeTeamFromSaveReinforcement = function removeTeamFromSaveReinforcement(team) {
  try {
    var reinforcedIndex = reinforcedTeams.indexOf(team.game_id);

    if (reinforcedIndex > -1) {
      reinforcedTeams.splice(reinforcedIndex, 1);
    }

    var blockIndex = blockGamesForReinforcement.indexOf(team.game_id);

    if (blockIndex > -1) {
      blockGamesForReinforcement.splice(blockIndex, 1);
    }
  } catch (e) {
    (0, _logger.logError)('removeTeamFromSaveReinforcement error', e);
  }
};

exports.removeTeamFromSaveReinforcement = removeTeamFromSaveReinforcement;

var blockGameForReinforcement = function blockGameForReinforcement(team) {
  try {
    (0, _logger.logInfo)(_logs["default"].BLOCK_GAME_FOR_REINFORCEMENT + (0, _logger.logParams)(team.game_id));
    var isAlreadyPresent = blockGamesForReinforcement.includes(team.game_id);

    if (!isAlreadyPresent) {
      blockGamesForReinforcement.push(team.game_id);
    }
  } catch (e) {
    (0, _logger.logError)('blockGameForReinforcement error', e);
  }
};

exports.blockGameForReinforcement = blockGameForReinforcement;

var isOutOfTime = function isOutOfTime(transaction_time) {
  var time = (Date.now() / 1000 - transaction_time) * 1000;
  return reinforceTimeoutMinutes > Math.floor(time / 1000 / 60);
};

var getGameProcessInfo = function getGameProcessInfo(gameProcess) {
  var attack = 0;
  var reinforce_attack = 0;
  var reinforce_defense = 0;
  var settle = 0;

  for (var i = 0; i < (gameProcess === null || gameProcess === void 0 ? void 0 : gameProcess.length); i++) {
    if (gameProcess[i].action === _constant["default"].attack) {
      attack = 1;
    }

    ;

    if (gameProcess[i].action === _constant["default"].reinforceAttack) {
      reinforce_attack++;
    }

    if (gameProcess[i].action === _constant["default"].reinforceDefense) {
      reinforce_defense++;
    }

    if (gameProcess[i].action === _constant["default"].settle) {
      settle++;
    }
  }

  return {
    attack: attack,
    reinforce_attack: reinforce_attack,
    reinforce_defense: reinforce_defense,
    settle: settle
  };
};

var canSendReinforcement = function canSendReinforcement(gameProcess, team, allTeams, config) {
  if (!gameProcess) {
    return false;
  }

  var _getGameProcessInfo2 = getGameProcessInfo(gameProcess),
      attack = _getGameProcessInfo2.attack,
      reinforce_attack = _getGameProcessInfo2.reinforce_attack,
      reinforce_defense = _getGameProcessInfo2.reinforce_defense,
      settle = _getGameProcessInfo2.settle;

  if (attack === 1 && reinforce_defense === 0 && settle === 0) {
    var isStillTime = isOutOfTime(gameProcess[1].transaction_time);

    if (!isStillTime) {
      (0, _logger.logInfo)(_logs["default"].REINFORCEMENT_TIME_OUT);
    }

    return isStillTime;
  }

  if (attack === 1 && reinforce_defense === 1 && reinforce_attack === 1 && settle === 0) {
    var _isStillTime = isOutOfTime(gameProcess[3].transaction_time);

    if (!_isStillTime) {
      (0, _logger.logInfo)(_logs["default"].REINFORCEMENT_TIME_OUT);
      saveReinforcedTeams(team);
      pauseScriptWhenReinforcCompleted(allTeams, config);
    }

    return _isStillTime;
  }

  if (attack === 1 && reinforce_defense === 1 && settle > 0) {
    saveReinforcedTeams(team);
    pauseScriptWhenReinforcCompleted(allTeams, config);
    return false;
  }

  if (attack === 1 && reinforce_defense === 0 && settle > 0) {
    saveReinforcedTeams(team);
    pauseScriptWhenReinforcCompleted(allTeams, config);
    return false;
  }

  return false;
};

exports.canSendReinforcement = canSendReinforcement;