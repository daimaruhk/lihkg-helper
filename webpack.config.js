const path = require('node:path');
const CopyPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  mode: 'production',
  entry: {
    content_script: './scripts/content_script/index.ts',
    client_script: ['./scripts/client_script/request.ts']
  },
  output: {
    filename: '[name].js',
    path: path.join(__dirname, 'dist', 'scripts'),
    clean: true
  },
  module: {
    rules: [
      {
        test: /\.(js|ts)$/,
        exclude: /node_modules/,
        use: ['ts-loader']
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader']
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  plugins: [
    new CopyPlugin({
      patterns: [{ from: 'static', to: '..' }]
    }),
    new MiniCssExtractPlugin({
      filename: '../styles.css'
    })
  ],
  optimization: {
    minimize: false,
  }
};