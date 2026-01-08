'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';

export type Theme = 'light' | 'dark' | 'system';
export type ColorTheme = 'default' | 'blue' | 'green' | 'purple' | 'orange';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  colorTheme: ColorTheme;
  setColorTheme: (theme: ColorTheme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { user, profile } = useAuth();
  const [theme, setTheme] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');
  const [colorTheme, setColorTheme] = useState<ColorTheme>('default');
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Initial load from localStorage and then profile
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    const savedColorTheme = localStorage.getItem('colorTheme') as ColorTheme | null;
    
    if (savedTheme) setTheme(savedTheme);
    if (savedColorTheme) setColorTheme(savedColorTheme);
    
    setIsInitialLoad(false);
  }, []);

  // Update from profile when it loads
  useEffect(() => {
    if (profile && (profile as any).theme_preference) {
      const { theme: dbTheme, colorTheme: dbColorTheme } = (profile as any).theme_preference;
      if (dbTheme) setTheme(dbTheme);
      if (dbColorTheme) setColorTheme(dbColorTheme);
    }
  }, [profile]);

  // Handle Light/Dark Mode
  useEffect(() => {
    const root = window.document.documentElement;

    const updateTheme = () => {
      let activeTheme: 'light' | 'dark';

      if (theme === 'system') {
        activeTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      } else {
        activeTheme = theme;
      }

      setResolvedTheme(activeTheme);
      root.classList.remove('light', 'dark');
      root.classList.add(activeTheme);

      if (theme !== 'system') {
        localStorage.setItem('theme', theme);
      } else {
        localStorage.removeItem('theme');
      }

      // Sync to DB
      if (!isInitialLoad && user) {
        syncThemeToDb(theme, colorTheme);
      }
    };

    updateTheme();

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        updateTheme();
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, user]);

  // Handle Color Theme
  useEffect(() => {
    const root = window.document.documentElement;
    root.setAttribute('data-theme-color', colorTheme);
    localStorage.setItem('colorTheme', colorTheme);

    // Sync to DB
    if (!isInitialLoad && user) {
      syncThemeToDb(theme, colorTheme);
    }
  }, [colorTheme, user]);

  const syncThemeToDb = async (t: Theme, ct: ColorTheme) => {
    if (!user) return;
    try {
      await supabase
        .from('profiles')
        .update({
          theme_preference: { theme: t, colorTheme: ct }
        })
        .eq('id', user.id);
    } catch (error) {
      console.error('Error syncing theme to DB:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, colorTheme, setColorTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
