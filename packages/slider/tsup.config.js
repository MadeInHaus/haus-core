import { defineConfig } from 'tsup';

export default defineConfig({
    entryPoints: ['src/index.tsx'],
    clean: true,
    dts: true,
    tsconfig: 'tsconfig.json',
    format: ['cjs', 'esm'],
    loader: {
        '.css': 'local-css',
    },
});
