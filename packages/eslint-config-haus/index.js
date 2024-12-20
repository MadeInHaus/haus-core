module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es6: true,
    node: true,
  },
  extends: ["next", "turbo"],
  plugins: ["@typescript-eslint"],
  root: true,
  rules: {
    "import/no-anonymous-default-export": "off",
    "import/no-unresolved": "off",
    "no-empty": "off",
    "react-hooks/exhaustive-deps": "warn",
    "react-hooks/rules-of-hooks": "error",
    "react/display-name": "off",
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": ["error"],
  },
};
