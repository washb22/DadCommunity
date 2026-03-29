import React, { createContext, useContext, useState, useMemo } from 'react';
import { useColorScheme, ViewStyle } from 'react-native';
import { colors } from './colors';
import { spacing } from './spacing';
import { typography } from './typography';
import { radius } from './radius';
import { shadows as lightShadows } from './shadows';

export type ThemeColors = typeof colors.light;

type ShadowLevels = Record<keyof typeof lightShadows, ViewStyle>;

export interface Theme {
  colors: ThemeColors;
  spacing: typeof spacing;
  typography: typeof typography;
  radius: typeof radius;
  shadows: ShadowLevels;
  isDark: boolean;
}

interface DarkModeContext {
  forceDarkMode: boolean;
  setForceDarkMode: (value: boolean) => void;
}

const ThemeContext = createContext<Theme | null>(null);
const DarkModeToggleContext = createContext<DarkModeContext>({
  forceDarkMode: false,
  setForceDarkMode: () => {},
});

const darkBorder: ViewStyle = {
  borderWidth: 1,
  borderColor: colors.dark.border,
};

const darkShadows: ShadowLevels = {
  level1: darkBorder,
  level2: darkBorder,
  level3: darkBorder,
  level4: darkBorder,
  level5: darkBorder,
};

export const ThemeProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const colorScheme = useColorScheme();
  const [forceDarkMode, setForceDarkMode] = useState(false);

  const isDark = forceDarkMode || colorScheme === 'dark';

  const theme: Theme = useMemo(() => ({
    colors: isDark ? colors.dark : colors.light,
    spacing,
    typography,
    radius,
    shadows: isDark ? darkShadows : lightShadows,
    isDark,
  }), [isDark]);

  const darkModeValue = useMemo(() => ({
    forceDarkMode,
    setForceDarkMode,
  }), [forceDarkMode]);

  return React.createElement(
    DarkModeToggleContext.Provider,
    { value: darkModeValue },
    React.createElement(
      ThemeContext.Provider,
      { value: theme },
      children,
    ),
  );
};

export const useTheme = (): Theme => {
  const theme = useContext(ThemeContext);
  if (!theme) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return theme;
};

export const useDarkMode = (): DarkModeContext => {
  return useContext(DarkModeToggleContext);
};

export { colors, spacing, typography, radius };
