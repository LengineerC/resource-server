const { default: merge } = require("webpack-merge");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
const webpack = require('webpack');
const baseConfig = require("./base.config");
const CopyWebpackPlugin=require("copy-webpack-plugin");
const path = require('path');

module.exports = merge(baseConfig, {
  mode:"development",
  entry: {
    client: path.resolve(__dirname, "../src/client/index.tsx"),
  },
  output: {
    path: path.resolve(__dirname, '../dist/client'),
    filename: '[name].bundle.js',
  },
  mode: 'development',
  target: 'web',
  devtool: 'inline-source-map',
  output:{
    publicPath: '/',
  },
  devServer: {
    static: [
      path.resolve(__dirname, '../dist/client'),
      path.resolve(__dirname,"../public"),
    ],
    port: 8080,
    hot:true,
    open: false,
    historyApiFallback: true,
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