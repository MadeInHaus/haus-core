import { defineConfig, type Options } from 'tsup';
import { sassPlugin, postcssModules } from 'esbuild-sass-plugin';

export default defineConfig((options: Options) => ({
    entryPoints: ['src/index.tsx'],
    clean: true,
    dts: true,
    format: ['cjs'],
    esbuildPlugins: [
        sassPlugin({
            filter: /\.module\.scss$/,
            transform: postcssModules({}),
        }),
    ],
    ...options,
}));
