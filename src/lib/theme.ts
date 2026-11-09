import { DefaultTheme, type Theme } from 'expo-router';

/** Mismos valores que `src/global.css`, para lo que no usa clases (navegación, íconos). */
export const THEME = {
  background: 'hsl(0 0% 100%)',
  foreground: 'hsl(0 0% 3.9%)',
  card: 'hsl(0 0% 100%)',
  primary: 'hsl(0 0% 9%)',
  mutedForeground: 'hsl(0 0% 45.1%)',
  destructive: 'hsl(0 84.2% 60.2%)',
  border: 'hsl(0 0% 89.8%)',
};

export const NAV_THEME: Theme = {
  ...DefaultTheme,
  colors: {
    background: THEME.background,
    border: THEME.border,
    card: THEME.card,
    notification: THEME.destructive,
    primary: THEME.primary,
    text: THEME.foreground,
  },
};
