const path = require('path');

module.exports = {
    stories: ['../stories/**/*.stories.mdx', '../stories/**/*.stories.tsx'],
    addons: [
        '@storybook/addon-actions',
        '@storybook/addon-docs',
        '@storybook/addon-essentials',
        '@storybook/addon-links',
        'storybook-dark-mode',
    ],
    framework: '@storybook/react',
    core: {
        builder: '@storybook/builder-vite',
    },
    async viteFinal(config, { configType }) {
        // customize the Vite config here
        return {
            ...config,
            resolve: {
                alias: [
                    {
                        find: '@madeinhaus/core',
                        replacement: path.resolve(__dirname, '../../../packages/core/'),
                    },
                    {
                        find: '@madeinhaus/utils',
                        replacement: path.resolve(__dirname, '../../../packages/utils/'),
                    },
                ],
            },
        };
    },
};
