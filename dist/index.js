"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _timeline = _interopRequireDefault(require("./timeline"));
var _timeline2 = require("./timeline.schema");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
var _default = {
  component: _timeline.default,
  schema: _timeline2.schema,
  ui: _timeline2.ui
};
exports.default = _default;
module.exports = exports.default;