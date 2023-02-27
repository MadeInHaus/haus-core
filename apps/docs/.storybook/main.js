const path = require('path');

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
                alias: [
                    {
                        find: '@madeinhaus/button',
                        replacement: path.resolve(__dirname, '../../../packages/button/'),
                    },
                    {
                        find: '@madeinhaus/disclosure',
                        replacement: path.resolve(__dirname, '../../../packages/disclosure/'),
                    },
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
