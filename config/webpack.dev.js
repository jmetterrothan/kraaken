/* eslint-disable */
const path = require("path");

const merge = require("webpack-merge");
const Dotenv = require("dotenv-webpack");

const baseConfig = require("./webpack.base");

console.info("\x1b[34m", "Starting project development server");

module.exports = merge(baseConfig, {
  mode: "development",
  output: {
    publicPath: "/",
    filename: "[name].[hash].js",
  },
  devServer: {
    port: 8080,
    historyApiFallback: true,
    hot: true,
    open: "chrome",
    watchOptions: {
      ignored: "./local/**/.*",
    },
  },
  devtool: "cheap-eval-source-map",
  plugins: [
    new Dotenv({
      path: path.resolve(process.cwd(), ".env.development"),
    }),
  ],
});
