export const themeColors: {
  primary: { light: string; dark: string };
  secondary: { light: string; dark: string };
  background: { light: string; dark: string };
  surface: { light: string; dark: string };
  surfaceElevated: { light: string; dark: string };
  foreground: { light: string; dark: string };
  muted: { light: string; dark: string };
  border: { light: string; dark: string };
  success: { light: string; dark: string };
  warning: { light: string; dark: string };
  error: { light: string; dark: string };
};

export const brandGradient: string[];

declare const themeConfig: {
  themeColors: typeof themeColors;
  brandGradient: string[];
};

export default themeConfig;
