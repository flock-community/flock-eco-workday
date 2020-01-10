module.exports = async ({config}) => ({
  ...config,
  module: {
    ...config.module,
    rules: config.module.rules.map(rule => ({
      ...rule,
      exclude: /node_modules\/(?!(@flock-eco)\/).*/,
    })),
  },
});
