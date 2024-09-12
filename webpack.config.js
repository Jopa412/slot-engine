const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const Dotenv = require('dotenv-webpack');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = (env, argv) => {
  let isDevelopmentMode = argv.mode === 'development';

  return {
    entry: './src/index.ts',
    resolve: {
      extensions: ['.ts', '.js'],
    },
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
      new CleanWebpackPlugin(),
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
    optimization: {
      minimizer: [new TerserPlugin()],
      concatenateModules: true,
    },
  };
};
