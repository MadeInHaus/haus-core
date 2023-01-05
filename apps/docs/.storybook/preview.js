import { themes } from "@storybook/theming";

export const parameters = {
  darkMode: {
    // Override the default dark theme
    dark: { ...themes.dark, appBg: "#1e1e1e" },
    // Override the default light theme
    light: { ...themes.normal },
  },
};
