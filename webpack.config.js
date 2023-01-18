const CopyWebpackPlugin = require("copy-webpack-plugin");
const ecoConfig = require("@flock-community/flock-eco-webpack");

const copyWebpackPlugin = new CopyWebpackPlugin({
  patterns: [
    { from: "src/main/react/favicon.ico", to: "./" },
  ],
});

const config = {
  ...ecoConfig,
  devServer: {
    ...ecoConfig.devServer,
    historyApiFallback: true,
    proxy: {
      ...ecoConfig.devServer.proxy,
      '/favicon.ico': 'http://localhost:8080',
      '/bootstrap': 'http://localhost:8080',
      '/logout': 'http://localhost:8080',
      '/tasks/*': 'http://localhost:8080',
      '/oauth2/*': 'http://localhost:8080',
    },
  },
  plugins: [
    ...ecoConfig.plugins,
    copyWebpackPlugin,
  ]
}
module.exports = config;
