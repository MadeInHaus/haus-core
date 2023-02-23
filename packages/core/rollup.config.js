import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import postcss from 'rollup-plugin-postcss';

import glob from 'glob';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const getFiles = ext => {
    return Object.fromEntries(
        glob.sync(`src/**/*.${ext}`).map(file => [
            // This remove `src/` as well as the file extension from each
            // file, so e.g. src/nested/foo.js becomes nested/foo
            path.relative('src', file.slice(0, file.length - path.extname(file).length)),
            // This expands the relative paths to absolute paths, so e.g.
            // src/nested/foo becomes /project/src/nested/foo.js
            fileURLToPath(new URL(file, import.meta.url)),
        ])
    );
};

export default {
    input: { ...getFiles('ts'), ...getFiles('tsx') },
    output: {
        format: 'esm',
        dir: 'dist',
        globals: { react: 'React' },
    },
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
