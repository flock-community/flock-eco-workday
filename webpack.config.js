const path = require('path')
const HtmlWebPackPlugin = require('html-webpack-plugin')

const htmlPlugin = new HtmlWebPackPlugin({
  template: path.join(__dirname, 'workday-application/src/main/react/index.html'),
  filename: './index.html',
})

module.exports = {
  entry: path.join(__dirname, 'workday-application/src/main/react'),

  output: {
    publicPath: '/',
    filename: '[name].[contenthash].js',
    path: path.join(__dirname, 'workday-application/target/classes/static'),
  },

  devtool: 'eval-source-map',

  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            plugins: [
              '@babel/plugin-proposal-class-properties',
              '@babel/plugin-transform-runtime',
            ],
            presets: [
              '@babel/preset-env',
              '@babel/preset-react',
              '@babel/preset-typescript',
            ],
          },
        },
      },
    ],
  },

  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    alias: {
      '@workday-core': path.resolve(__dirname, 'workday-core/src/main/react'),
      '@workday-user': path.resolve(__dirname, 'workday-user/src/main/react'),
    },
    modules: [path.resolve(__dirname, 'node_modules'), 'node_modules'],
  },

  plugins: [htmlPlugin],

  devServer: {
    port: 3000,
    host: 'localhost',
    historyApiFallback: true,
    proxy: {
      '/api/**': {
        target: 'http://localhost:8080',
        changeOrigin: false,
        cookieDomainRewrite: 'localhost',
      },
      '/login': {
        target: 'http://localhost:8080',
        changeOrigin: false,
        cookieDomainRewrite: 'localhost',
      },
      '/logout': {
        target: 'http://localhost:8080',
        changeOrigin: false,
        cookieDomainRewrite: 'localhost',
      },
      '/bootstrap': {
        target: 'http://localhost:8080',
        changeOrigin: false,
        cookieDomainRewrite: 'localhost',
      },
      '/tasks/*': {
        target: 'http://localhost:8080',
        changeOrigin: false,
        cookieDomainRewrite: 'localhost',
      },
      '/export/*': {
        target: 'http://localhost:8080',
        changeOrigin: false,
        cookieDomainRewrite: 'localhost',
      },
      '/oauth2/*': {
        target: 'http://localhost:8080',
        changeOrigin: false,
        cookieDomainRewrite: 'localhost',
      },
      '/images/**': 'http://localhost:8080',
    },
  },
}
