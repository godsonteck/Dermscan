import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'light' | 'dark';
export type FontScale = 'normal' | 'large' | 'xlarge';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  fontScale: FontScale;
  changeFontScale: (scale: FontScale) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('dermscan_theme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme;
    }
    // Default to dark, as our healthcare app has a medical deep dashboard dark theme
    return 'dark';
  });

  const [fontScale, setFontScale] = useState<FontScale>(() => {
    const savedScale = localStorage.getItem('dermscan_fontscale');
    if (savedScale === 'normal' || savedScale === 'large' || savedScale === 'xlarge') {
      return savedScale;
    }
    return 'normal';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    localStorage.setItem('dermscan_theme', theme);
  }, [theme]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('scale-large', 'scale-xlarge');
    if (fontScale === 'large') {
      root.classList.add('scale-large');
    } else if (fontScale === 'xlarge') {
      root.classList.add('scale-xlarge');
    }
    localStorage.setItem('dermscan_fontscale', fontScale);
  }, [fontScale]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const changeFontScale = (scale: FontScale) => {
    setFontScale(scale);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, fontScale, changeFontScale }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be invoked within a ThemeProvider');
  }
  return context;
}
