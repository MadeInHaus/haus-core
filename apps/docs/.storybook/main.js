const path = require('path');

const aliasedPackages = ['button', 'disclosure', 'contentful-image', 'portal', 'core', 'utils'];

module.exports = {
    stories: ['../stories/**/*.stories.mdx', '../stories/**/*.stories.tsx'],
    addons: ['@storybook/addon-links', '@storybook/addon-essentials'],
    framework: '@storybook/react',
    core: {
        builder: '@storybook/builder-vite',
    },
    async viteFinal(config, { configType }) {
        // customize the Vite config here
        return {
            ...config,
            resolve: {
                alias: aliasedPackages.map(packageName => ({
                    find: `@madeinhaus/${packageName}`,
                    replacement: path.resolve(__dirname, `../../../packages/${packageName}/`),
                })),
            },
        };
    },
};
