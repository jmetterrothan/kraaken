/* eslint-disable */
const path = require("path");

const PATHS = require("./paths");

module.exports = {
  "@root": path.resolve(PATHS.ROOT),
  "@src": path.resolve(PATHS.SRC),
  "@shared": path.resolve(PATHS.SHARED),
  "@assets": path.resolve(PATHS.ASSETS),
  "@sass": path.resolve(PATHS.SASS),
  "@images": path.resolve(PATHS.IMAGES),
  "@fonts": path.resolve(PATHS.FONTS)
};
