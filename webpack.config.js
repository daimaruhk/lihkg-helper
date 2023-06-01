const path = require('node:path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: {
    content_script: './scripts/content_script.ts',
    service_worker: './scripts/service_worker.ts',
    client_script: './scripts/client_script.ts'
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
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  plugins: [
    new CopyPlugin({
      patterns: [{ from: 'static', to: '..' }]
    })
  ],
  optimization: {
    minimize: false,
  }
};