const webpack = require('webpack');
const path = require('path');

module.exports = {
  entry: './server.js', // Your main backend file
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  target: 'node', // For backend-specific features
  plugins: [
    new webpack.DefinePlugin({
      'process.env.VARIABLE_NAME': JSON.stringify(process.env.VARIABLE_NAME),
      'process.env.ANOTHER_VARIABLE': JSON.stringify(process.env.ANOTHER_VARIABLE),
    }),
  ],
};
