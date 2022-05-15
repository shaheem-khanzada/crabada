"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _stream = require("stream");

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

var AppendInitVect = /*#__PURE__*/function (_Transform) {
  (0, _inherits2["default"])(AppendInitVect, _Transform);

  var _super = _createSuper(AppendInitVect);

  function AppendInitVect(initVect, opts) {
    var _this;

    (0, _classCallCheck2["default"])(this, AppendInitVect);
    _this = _super.call(this, opts);
    _this.initVect = initVect;
    _this.appended = false;
    return _this;
  }

  (0, _createClass2["default"])(AppendInitVect, [{
    key: "_transform",
    value: function _transform(chunk, _encoding, cb) {
      if (!this.appended) {
        this.push(this.initVect);
        this.appended = true;
      }

      this.push(chunk);
      cb();
    }
  }]);
  return AppendInitVect;
}(_stream.Transform);

var _default = AppendInitVect;
exports["default"] = _default;