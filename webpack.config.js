const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
// const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const Dotenv = require('dotenv-webpack');
const TerserPlugin = require('terser-webpack-plugin');

const commonConfig = {
  node: {
    __dirname: true,
  },
  mode: process.env.NODE_ENV || 'development',
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        enforce: 'pre',
        use: [
          {
            loader: 'ts-loader',
          },
        ],
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: ['file-loader'],
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        use: ['file-loader'],
      },
    ],
  },
};

module.exports = (env, argv) => {
  let isDevelopmentMode = argv.mode === 'development';

  return [
    Object.assign({}, commonConfig, {
      target: 'electron-main',
      entry: './electron-main.js',
      output: {
        filename: 'electron-main.js',
        path: path.resolve(__dirname, 'public'),
        publicPath: './',
      },
    }),
    Object.assign({}, commonConfig, {
      target: 'electron-renderer',
      entry: './src/index.ts',
      output: {
        filename: 'app.js',
        path: path.resolve(__dirname, 'public'),
        publicPath: './',
      },
      devtool: isDevelopmentMode ? 'eval-source-map' : 'nosources-source-map',
      devServer: {
        allowedHosts: 'all',
        static: {
          directory: './public',
        },
        devMiddleware: {
          publicPath: '/',
        },
      },
      plugins: [
        // new CleanWebpackPlugin(),
        new Dotenv(),
        new CopyPlugin({
          patterns: [
            {
              from: './static',
              globOptions: {
                ignore: ['**/index.html'],
              },
            },
          ],
        }),
        new HtmlWebpackPlugin({
          template: './static/index.html',
        }),
      ],
      optimization: {
        minimizer: [new TerserPlugin()],
        concatenateModules: true,
      },
    }),
  ];
};
