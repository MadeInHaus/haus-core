import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import postcss from 'rollup-plugin-postcss';

const packageJson = require('./package.json');

const config = {
    input: 'src/index.tsx',
    output: [
        {
            file: packageJson.main,
            format: 'cjs',
            sourcemap: true,
            globals: { react: 'React' },
            exports: 'named',
        },
        {
            file: packageJson.module,
            format: 'esm',
            sourcemap: true,
            globals: { react: 'React' },
            exports: 'named',
        },
    ],
    plugins: [
        resolve(),
        commonjs(),
        typescript({ useTsconfigDeclarationDir: true }),
        postcss({
            extract: false,
            modules: true,
            use: ['sass'],
        }),
    ],
    external: ['react', 'react-dom', 'next/router', 'next/link'],
};

export default config;