const { default: merge } = require("webpack-merge");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
const CopyWebpackPlugin=require("copy-webpack-plugin");
const webpack = require('webpack');
const baseConfig = require("./base.config");
const path = require('path');

module.exports = merge(baseConfig, {
  mode: "production",
  entry: {
    client: path.resolve(__dirname, "../src/client/index.tsx"),
  },
  output: {
    publicPath: './',
    path: path.resolve(__dirname,"../dist/client")
  },
  devtool: 'source-map',
  optimization: {
    minimize: true,
  },
  plugins: [
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin({
      patterns:[
        {
          from: path.resolve(__dirname, "../public/streamsaver"),
          to: "streamsaver",
          noErrorOnMissing: true
        },
      ]
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "../src/client/index.html"),
      filename: 'index.html',
      inject: 'body',
    }),
    new NodePolyfillPlugin(),
    new webpack.ProvidePlugin({
      TextEncoder: ['text-encoding', 'TextEncoder'],
      TextDecoder: ['text-encoding', 'TextDecoder'],
    }),
    new webpack.HotModuleReplacementPlugin(), 
  ],
});