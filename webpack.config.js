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
    // TODO: create separate config to do local development with the Ory stack
    host: '0.0.0.0', // needed for the Ory stack
    disableHostCheck: true, // needed for the Ory stack
    proxy: {
      ...ecoConfig.devServer.proxy,
      "/api": "http://workday.flock.local:8081",
      "/login": "http://workday.flock.local:8081",
      "/bootstrap": "http://workday.flock.local:8081",
      "/logout": "http://workday.flock.local:8081",
      "/tasks/*": "http://workday.flock.local:8081",
      "/export/*": "http://workday.flock.local:8081",
      "/oauth2/*": "http://workday.flock.local:8081",
    },
  },
};
module.exports = config;
