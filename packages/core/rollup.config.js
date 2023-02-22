import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import postcss from 'rollup-plugin-postcss';
import pkg from './package.json';

export default {
    input: 'src/index.ts',
    output: [
        {
            file: pkg.main,
            format: 'cjs',
            sourcemap: true,
            globals: { react: 'React' },
        },
        {
            file: pkg.module,
            format: 'esm',
            sourcemap: true,
            globals: { react: 'React' },
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
    external: ['react', 'react-dom'],
};
