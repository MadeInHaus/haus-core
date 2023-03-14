import * as React from 'react';

const DARK = 'dark';
const LIGHT = 'light';
const AUTO = 'auto';

const themes = [AUTO, DARK, LIGHT];
const defaultTheme = AUTO;
const systemThemeMap = { auto: AUTO, dark: DARK, light: LIGHT };
const defaultThemesDef: ThemeDefType = { themes, systemThemeMap, defaultTheme };

export interface ThemeDefType {
    themes: string[];
    defaultTheme: string;
    systemThemeMap?: { auto: string; dark: string; light: string };
    localStorageKey?: string;
}

export interface ThemeProviderProps {
    themesDef?: ThemeDefType;
    children: React.ReactNode;
}

export interface ThemeScriptProps {
    themesDef?: ThemeDefType;
}

interface ThemeInternalType {
    theme: string | null;
    themeValue: string | null;
    themesDef: ThemeDefType;
}

interface ThemeContextType extends ThemeInternalType {
    setTheme: (theme: string) => void;
}

const ThemeContext = React.createContext<ThemeContextType | null>(null);

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
    themesDef = defaultThemesDef,
    children,
}) => {
    const localStorageKey = themesDef.localStorageKey ?? 'theme';

    const [{ theme, themeValue }, setThemeInternal] = React.useState<ThemeInternalType>({
        theme: null,
        themeValue: null,
        themesDef,
    });

    const getThemeValue = React.useCallback(
        (theme: string, isSystemDarkMode?: boolean) => {
            const { systemThemeMap } = themesDef;
            if (theme === systemThemeMap?.auto) {
                if (typeof isSystemDarkMode === 'undefined') {
                    const mql = window.matchMedia('(prefers-color-scheme: dark)');
                    isSystemDarkMode = mql.matches;
                }
                return isSystemDarkMode ? systemThemeMap.dark : systemThemeMap.light;
            }
            return theme;
        },
        [themesDef]
    );

    const applyTheme = React.useCallback(
        (theme: string | null, isSystemDarkMode?: boolean) => {
            if (theme) {
                const themeValue = getThemeValue(theme, isSystemDarkMode);
                document.documentElement.dataset.theme = themeValue;
                setThemeInternal({ theme, themeValue, themesDef });
            }
        },
        [getThemeValue, themesDef]
    );

    const setTheme = React.useCallback(
        (theme: string) => {
            localStorage.setItem(localStorageKey, theme);
            applyTheme(theme);
        },
        [localStorageKey, applyTheme]
    );

    React.useEffect(() => {
        const mql = window.matchMedia('(prefers-color-scheme: dark)');
        const saved = window.localStorage.getItem(localStorageKey);
        const themeNew = saved ?? themesDef.defaultTheme;
        const themeValueNew = getThemeValue(themeNew, mql.matches);
        if (themeNew !== theme || themeValueNew !== themeValue) {
            setThemeInternal({ theme: themeNew, themeValue: themeValueNew, themesDef });
        }
        const handleChange = (event: MediaQueryListEvent) => {
            applyTheme(theme, event.matches);
        };
        mql.addEventListener('change', handleChange);
        return () => mql.removeEventListener('change', handleChange);
    }, [theme, themeValue, localStorageKey, themesDef, getThemeValue, applyTheme]);

    return (
        <ThemeContext.Provider value={{ theme, themeValue, themesDef, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = (): ThemeContextType | null => React.useContext(ThemeContext);

export const ThemeScript: React.FC<ThemeScriptProps> = ({ themesDef = defaultThemesDef }) => {
    const localStorageKey = themesDef.localStorageKey ?? 'theme';
    const themeScript = `
        (function() {
            const themesDef = ${JSON.stringify(themesDef)};
            function getThemeValue() {
                const saved = window.localStorage.getItem('${localStorageKey}');
                const theme = saved ?? themesDef.defaultTheme;
                if (theme === themesDef.systemThemeMap.auto) {
                    const mql = window.matchMedia('(prefers-color-scheme: dark)');
                    return mql.matches ? themesDef.systemThemeMap.dark : themesDef.systemThemeMap.light;
                }
                return theme;
            }
            const themeValue = getThemeValue();
            document.documentElement.dataset.theme = themeValue;
        })();
    `;
    return <script dangerouslySetInnerHTML={{ __html: themeScript }} />;
};
