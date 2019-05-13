const path = require('path')
const HtmlWebPackPlugin = require('html-webpack-plugin')

const htmlPlugin = new HtmlWebPackPlugin({
  template: path.join(__dirname, 'src/main/react/index.html'),
  filename: './index.html',
})

module.exports = {
  entry: path.join(__dirname, 'src/main/react'),

  output: {
    path: path.resolve(__dirname, 'src/main/webapp')
  },

  devtool: 'eval-source-map',
  module: {
    rules: [
      {
        test: /\.js|jsx$/,
        exclude: /node_modules\/(?!(@flock-eco)\/).*/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['env', 'react', 'stage-2'],
          },
        },
      },
    ],
  },

  plugins: [htmlPlugin],

  devServer: {
    port: 3000,
    host: '0.0.0.0',
    proxy: {
      '/api/**': 'http://localhost:8080',
      '/oauth2/**': 'http://localhost:8080',
      '/login': 'http://localhost:8080',
    },
  },
}
