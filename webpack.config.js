const ecoConfig = require("@flock-community/flock-eco-webpack");

const config = {
  optimization: {
    runtimeChunk: true,
    splitChunks: {
      chunks: "all",
    },
  },
  cache: {
    type: "filesystem",
    maxAge: 5184000000, // one month
    buildDependencies: {
      // This makes all dependencies of this file - build dependencies
      config: [__filename],
      // By default webpack and loaders are build dependencies
    },
  },
  ...ecoConfig,
  devServer: {
    ...ecoConfig.devServer,
    historyApiFallback: true,
    host: '0.0.0.0', // needed for the Ory stack running in docker
    disableHostCheck: true, // needed for the Ory stack running in docker
    proxy: {
      ...ecoConfig.devServer.proxy,
      "/bootstrap": "http://localhost:8080",
      "/logout": "http://localhost:8080",
      "/tasks/*": "http://localhost:8080",
      "/export/*": "http://localhost:8080",
      "/oauth2/*": "http://localhost:8080",
    },
  },
};
module.exports = config;
