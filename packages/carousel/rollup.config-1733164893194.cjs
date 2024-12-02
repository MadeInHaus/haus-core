'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var resolve = require('@rollup/plugin-node-resolve');
var commonjs = require('@rollup/plugin-commonjs');
var ts = require('@rollup/plugin-typescript');
var postcss = require('rollup-plugin-postcss');

const packageJson = require('./package.json');

var rollup_config = {
    input: 'src/index.tsx',
    output: [
        {
            file: packageJson.main,
            format: 'cjs',
            globals: { react: 'React' },
        },
        {
            file: packageJson.module,
            format: 'esm',
            globals: { react: 'React' },
        },
    ],
    plugins: [
        resolve(),
        commonjs(),
        ts(),
        postcss({
            extract: true,
            modules: true,
            use: ['sass'],
        }),
    ],
    external: ['react', 'react-dom'],
};

exports.default = rollup_config;
