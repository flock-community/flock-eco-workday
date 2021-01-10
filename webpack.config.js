const ecoConfig = require("@flock-community/flock-eco-webpack");

const config = {
  ...ecoConfig,
  devServer: {
    ...ecoConfig.devServer,
    historyApiFallback: true,
    proxy: {
      ...ecoConfig.devServer.proxy,
      '/bootstrap': 'http://localhost:8080',
      '/logout': 'http://localhost:8080',
      '/tasks/*': 'http://localhost:8080',
    },
  },
}
module.exports = config;
