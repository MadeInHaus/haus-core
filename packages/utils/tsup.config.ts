import { defineConfig, type Options } from 'tsup';

export default defineConfig((options: Options) => ({
    entryPoints: ['src/index.tsx'],
    clean: true,
    dts: true,
    tsconfig: 'tsconfig.json',
    format: ['cjs', 'esm'],
    ...options,
}));
