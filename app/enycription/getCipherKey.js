"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _crypto = require("crypto");

function getCipherKey(password) {
  return (0, _crypto.createHash)('sha256').update(password).digest();
}

var _default = getCipherKey;
exports["default"] = _default;