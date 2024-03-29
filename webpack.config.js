const ecoConfig = require("@flock-community/flock-eco-webpack");

const config = {
  ...ecoConfig,
  devServer: {
    ...ecoConfig.devServer,
    historyApiFallback: true,
    proxy: {
      ...ecoConfig.devServer.proxy,
      '/api/**': 'http://localhost:80',
      '/graphql': 'http://localhost:80',
      '/login': 'http://localhost:80',
      "/bootstrap": "http://localhost:80",
      "/logout": "http://localhost:80",
      "/tasks/*": "http://localhost:80",
      "/export/*": "http://localhost:80",
      "/oauth2/*": "http://localhost:80",
    },
  },
};
module.exports = config;
