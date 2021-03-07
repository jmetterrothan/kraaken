/* eslint-disable */
const path = require("path");

const merge = require("webpack-merge");
const Dotenv = require("dotenv-webpack");

const baseConfig = require("./webpack.base");

module.exports = merge(baseConfig, {
  mode: "production",
  plugins: [
    new Dotenv({
      path: path.resolve(process.cwd(), ".env"),
    }),
  ],
});
