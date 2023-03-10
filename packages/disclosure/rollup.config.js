import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import ts from 'rollup-plugin-ts';
import postcss from 'rollup-plugin-postcss';

const packageJson = require('./package.json');

export default {
    input: 'src/index.tsx',
    output: [
        {
            file: packageJson.main,
            format: 'cjs',
            globals: { react: 'React' },
            exports: 'named',
        },
        {
            file: packageJson.module,
            format: 'esm',
            globals: { react: 'React' },
            exports: 'named',
        },
    ],
    plugins: [
        resolve(),
        commonjs(),
        ts(),
        postcss({
            extract: false,
            modules: true,
            use: ['sass'],
        }),
    ],
    external: ['react', 'react-dom'],
};
