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
    backgrounds: {
        disable: true,
    },
};
