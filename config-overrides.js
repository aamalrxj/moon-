module.exports = function override(config, env) {
  config.ignoreWarnings = [
    { message: /Failed to parse source map/ }
  ];
  return config;
};
