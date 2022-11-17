module.exports = {
  root: true,
  // This tells ESLint to load the config from the package `eslint-config-haus-ui`
  extends: ["haus-ui"],
  settings: {
    next: {
      rootDir: ["apps/*/"],
    },
  },
};
