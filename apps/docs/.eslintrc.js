module.exports = {
    env: {
        browser: true,
        commonjs: true,
        es6: true,
        node: true,
    },
    extends: ['next', 'turbo'],
    root: true,
    rules: {
        'import/no-unresolved': 'off',
        'no-empty': 'off',
        'no-unused-vars': 'warn',
        'no-undef': 'warn',
        'react-hooks/exhaustive-deps': 'warn',
        'react-hooks/rules-of-hooks': 'error',
        'react/display-name': 'off',
    },
};
