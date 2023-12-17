const path = require('path');

module.exports = {
  mode: 'development',
  entry: './src/game.ts',  // Your main TypeScript file
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: 'bundle.js',  // Output JavaScript bundle
    path: path.resolve(__dirname, 'dist'),
  },
};
