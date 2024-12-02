import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import ts from '@rollup/plugin-typescript';

const packageJson = require('./package.json');

export default {
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
    plugins: [resolve(), commonjs(), ts()],
    external: ['react', 'react-dom'],
};
