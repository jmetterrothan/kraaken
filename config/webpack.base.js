const path = require("path");

const HtmlWebpackPlugin = require("html-webpack-plugin");
const autoprefixer = require("autoprefixer");

const PATHS = require("./paths");
const ALIAS = require("./alias");

// @ts-ignore
module.exports = {
  entry: {
    bundle: ["@babel/polyfill", path.join(PATHS.SRC, "index.tsx")],
  },
  resolve: {
    modules: ["node_modules", PATHS.SRC],
    extensions: [".ts", ".tsx", ".js", ".json", ".scss", ".css"],
    alias: { ...ALIAS },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        enforce: "pre",
        exclude: "/node_modules/",
        use: [{ loader: "babel-loader" }, { loader: "eslint-loader" }],
      },
      {
        test: /\.(css|scss|sass)$/,
        use: [
          "style-loader",
          "css-loader",
          {
            loader: "postcss-loader",
            options: {
              plugins: () => [
                autoprefixer({
                  flexbox: "no-2009",
                }),
              ],
            },
          },
          "sass-loader",
          {
            loader: "sass-resources-loader",
            options: {
              resources: [path.join(PATHS.SASS, "abstracts", "_variables.scss")],
            },
          },
        ],
      },
      {
        test: /\.(png|jpe?g|wav)$/,
        use: [
          {
            loader: "file-loader",
            options: {
              name: "[name].[ext]",
            },
          },
        ],
      },
      {
        test: /\.glsl$/,
        loader: "webpack-glsl-loader",
      },
      {
        test: /\.(woff(2)?|ttf|eot|svg|otf)(\?v=\d+\.\d+\.\d+)?$/,
        use: [
          {
            loader: "file-loader",
            options: {
              name: "[name].[ext]",
              outputPath: "fonts/",
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(PATHS.ASSETS, "template.html"),
      title: "Kraken",
      filename: "index.html",
      inject: "body",
    }),
  ],
};
