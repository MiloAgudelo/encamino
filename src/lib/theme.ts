import { DefaultTheme, type Theme } from 'expo-router';

/** Mismos valores que `src/global.css`, para lo que no usa clases (navegación, íconos). */
export const THEME = {
  background: 'hsl(34 37% 96%)',
  foreground: 'hsl(0 0% 10%)',
  card: 'hsl(0 0% 100%)',
  primary: 'hsl(16 42% 32%)',
  primaryForeground: 'hsl(34 37% 98%)',
  mutedForeground: 'hsl(20 15% 38%)',
  destructive: 'hsl(8 65% 42%)',
  border: 'hsl(30 28% 86%)',
  dorado: 'hsl(38 50% 58%)',
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
