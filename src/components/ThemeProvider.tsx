
"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from "next-themes";
import type { ThemeProviderProps } from "next-themes/dist/types";

export type ColorScheme = "teal" | "blue" | "orange";
export type AppearanceMode = "light" | "dark" | "system";

interface AppThemeContextType {
  appearanceMode?: AppearanceMode;
  setAppearanceMode: (mode: AppearanceMode) => void;
  resolvedAppearanceMode?: string; // 'light' or 'dark'
  colorScheme: ColorScheme;
  setColorScheme: (scheme: ColorScheme) => void;
}

const AppThemeContext = React.createContext<AppThemeContextType | undefined>(undefined);

export function useAppTheme() {
  const context = React.useContext(AppThemeContext);
  if (context === undefined) {
    throw new Error("useAppTheme must be used within a ThemeProvider");
  }
  return context;
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps & { children: React.ReactNode }) {
  const { theme: nextTheme, setTheme: setNextTheme, resolvedTheme } = useNextTheme();
  const [colorScheme, setColorSchemeState] = React.useState<ColorScheme>("teal");

  React.useEffect(() => {
    const savedColorScheme = localStorage.getItem("billtrack-color-scheme") as ColorScheme | null;
    const initialColorScheme = savedColorScheme || "teal";
    setColorSchemeState(initialColorScheme);
    document.documentElement.setAttribute("data-color-theme", initialColorScheme);
  }, []);

  const setColorScheme = (scheme: ColorScheme) => {
    setColorSchemeState(scheme);
    localStorage.setItem("billtrack-color-scheme", scheme);
    document.documentElement.setAttribute("data-color-theme", scheme);
  };

  const appearanceMode = nextTheme as AppearanceMode | undefined;

  const setAppearanceMode = (mode: AppearanceMode) => {
    setNextTheme(mode);
  };
  
  const contextValue: AppThemeContextType = {
    appearanceMode,
    setAppearanceMode,
    resolvedAppearanceMode: resolvedTheme,
    colorScheme,
    setColorScheme,
  };

  return (
    <NextThemesProvider {...props}>
      <AppThemeContext.Provider value={contextValue}>
        {children}
      </AppThemeContext.Provider>
    </NextThemesProvider>
  );
}
