/* eslint-disable */
const merge = require("webpack-merge");
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
  plugins: [],
});
