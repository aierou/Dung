const path = require('path');

module.exports = {
  mode: 'development',
  entry: './src/index.ts',
  devtool: 'inline-source-map',
  devServer: {
    contentBase: './public',
    port: 1234,
    open: false,
    hot: false,
    host: '0.0.0.0',
    disableHostCheck: true,
  },
  module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            }
        ]
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js']
  },
  output: {
    filename: 'dung.js',
    publicPath: 'scripts/'
  }
};