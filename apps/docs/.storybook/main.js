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
                        find: '@madeinhaus/ui',
                        replacement: path.resolve(
                            __dirname,
                            '../../../packages/ui/'
                        ),
                    },
                    {
                        find: '@madeinhaus/contentful',
                        replacement: path.resolve(
                            __dirname,
                            '../../../packages/contentful/'
                        ),
                    },
                    {
                        find: '@madeinhaus/utils',
                        replacement: path.resolve(
                            __dirname,
                            '../../../packages/utils/'
                        ),
                    },
                    {
                        find: '@madeinhaus/hooks',
                        replacement: path.resolve(
                            __dirname,
                            '../../../packages/hooks/'
                        ),
                    },
                ],
            },
        };
    },
};
