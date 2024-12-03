import { defineConfig, type Options } from 'tsup';

export default defineConfig((options: Options) => ({
    entryPoints: ['src/index.tsx'],
    clean: true,
    dts: true,
    format: ['cjs', 'esm'],
    ...options,
}));
