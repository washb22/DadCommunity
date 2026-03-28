import React, { createContext, useContext } from 'react';
import { useColorScheme } from 'react-native';
import { colors } from './colors';
import { spacing } from './spacing';
import { typography } from './typography';
import { radius } from './radius';
import { shadows } from './shadows';

export type ThemeColors = typeof colors.light;

export interface Theme {
  colors: ThemeColors;
  spacing: typeof spacing;
  typography: typeof typography;
  radius: typeof radius;
  shadows: typeof shadows;
  isDark: boolean;
}

const ThemeContext = createContext<Theme | null>(null);

export const ThemeProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const theme: Theme = {
    colors: isDark ? colors.dark : colors.light,
    spacing,
    typography,
    radius,
    shadows,
    isDark,
  };

  return React.createElement(
    ThemeContext.Provider,
    { value: theme },
    children,
  );
};

export const useTheme = (): Theme => {
  const theme = useContext(ThemeContext);
  if (!theme) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return theme;
};

export { colors, spacing, typography, radius, shadows };
