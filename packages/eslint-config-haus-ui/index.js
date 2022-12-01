module.exports = {
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "next",
    "turbo",
    "prettier",
  ],
  rules: {
    "no-empty": 0,
    "no-unused-vars": "warn",
    "react/display-name": 0,
    "react/no-unknown-property": "warn",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
  },
};
