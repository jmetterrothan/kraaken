const merge = require("webpack-merge");
const baseConfig = require("./webpack.base");

const PATHS = require("./paths");

console.info("\x1b[34m", "Starting project development server");

// @ts-ignore
module.exports = merge(baseConfig, {
  mode: "development",
  output: {
    publicPath: "/",
    filename: "[name].[hash].js"
  },
  devServer: {
    port: 8080,
    historyApiFallback: true,
    hot: true,
    open: "chrome"
  },
  devtool: "cheap-eval-source-map",
  plugins: []
});
