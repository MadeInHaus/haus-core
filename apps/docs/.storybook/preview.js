import { themes } from '@storybook/theming';

import './style.css';

export const parameters = {
    darkMode: {
        light: { ...themes.normal },
        dark: { ...themes.dark, appBg: '#1e1e1e' },
        lightClass: 'lightClass',
        darkClass: 'darkClass',
        stylePreview: true,
    },
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
        matchers: {
            color: /(background|color)$/i,
            date: /Date$/,
        },
    },
    backgrounds: {
        disable: true,
    },
};
