"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.saveReinforcedTeams = exports.removeTeamFromSaveReinforcement = exports.pauseScriptWhenReinforcCompleted = exports.canSendReinforcement = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _ = require(".");

var _constant = _interopRequireDefault(require("../constant"));

var _logger = require("../logger");

var _logs = _interopRequireDefault(require("../logs.json"));

var reinforcedTeams = [];

var saveReinforcedTeams = function saveReinforcedTeams(team) {
  try {
    var isAlreadyPresent = reinforcedTeams.includes(team.game_id);

    if (!isAlreadyPresent) {
      reinforcedTeams.push(team.game_id);
    }
  } catch (e) {
    (0, _logger.logError)('saveReinforcedTeams error', e);
  }
};

exports.saveReinforcedTeams = saveReinforcedTeams;

var pauseScriptWhenReinforcCompleted = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(allTeams) {
    var isAllReinforced;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            isAllReinforced = allTeams.every(function (team) {
              return reinforcedTeams.includes(team.game_id);
            });

            if (!isAllReinforced) {
              _context.next = 6;
              break;
            }

            (0, _logger.logSuccess)(_logs["default"].ALL_REINFORCEMENT_COMPLETED);
            _context.next = 6;
            return (0, _.sleep)(1200000);

          case 6:
            _context.next = 11;
            break;

          case 8:
            _context.prev = 8;
            _context.t0 = _context["catch"](0);
            (0, _logger.logError)('pauseScriptWhenReinforcCompleted error', _context.t0);

          case 11:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[0, 8]]);
  }));

  return function pauseScriptWhenReinforcCompleted(_x) {
    return _ref.apply(this, arguments);
  };
}();

exports.pauseScriptWhenReinforcCompleted = pauseScriptWhenReinforcCompleted;

var removeTeamFromSaveReinforcement = function removeTeamFromSaveReinforcement(team) {
  try {
    var index = reinforcedTeams.indexOf(team.game_id);

    if (index > -1) {
      reinforcedTeams.splice(index, 1);
    }
  } catch (e) {
    (0, _logger.logError)('removeTeamFromSaveReinforcement error', e);
  }
};

exports.removeTeamFromSaveReinforcement = removeTeamFromSaveReinforcement;

var canSendReinforcement = /*#__PURE__*/function () {
  var _ref2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(gameProcess, team, allTeams) {
    var attack, reinforce_attack, reinforce_defense, isGameSettle, canProceed, i;
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            if (gameProcess) {
              _context2.next = 2;
              break;
            }

            return _context2.abrupt("return", false);

          case 2:
            attack = 0;
            reinforce_attack = 0;
            reinforce_defense = 0;
            isGameSettle = gameProcess === null || gameProcess === void 0 ? void 0 : gameProcess.some(function (p) {
              return (p === null || p === void 0 ? void 0 : p.action) === 'settle';
            });
            canProceed = false;

            for (i = 0; i < (gameProcess === null || gameProcess === void 0 ? void 0 : gameProcess.length); i++) {
              if (gameProcess[i].action == _constant["default"].attack) attack = 1;
              if (gameProcess[i].action == _constant["default"].reinforceAttack) reinforce_attack++;
              if (gameProcess[i].action == _constant["default"].reinforceDefense) reinforce_defense++;
            }

            if (attack == 1 && reinforce_attack == 0 && reinforce_defense == 0) {
              canProceed = true;

              if (isGameSettle) {
                (0, _logger.logInfo)('Out of time to send reinforcement');
              }
            }

            if (attack == 1 && reinforce_attack == 1 && reinforce_defense == 1) {
              canProceed = true;

              if (isGameSettle) {
                (0, _logger.logInfo)('Out of time to send reinforcement');
              }
            }

            if (!(isGameSettle && canProceed)) {
              _context2.next = 14;
              break;
            }

            saveReinforcedTeams(team);
            _context2.next = 14;
            return pauseScriptWhenReinforcCompleted(allTeams);

          case 14:
            return _context2.abrupt("return", canProceed && !isGameSettle);

          case 15:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));

  return function canSendReinforcement(_x2, _x3, _x4) {
    return _ref2.apply(this, arguments);
  };
}();

exports.canSendReinforcement = canSendReinforcement;