'use client';

import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme, Theme } from '@/contexts/ThemeContext';
import { useEffect, useState } from 'react';

export default function DarkModeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="w-10 h-10" />;

  const cycleTheme = () => {
    const themes: Theme[] = ['light', 'dark', 'system'];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  const getThemeIcon = () => {
    if (theme === 'light') return <Sun size={20} />;
    if (theme === 'dark') return <Moon size={20} />;
    return <Monitor size={20} />;
  };

  const getThemeLabel = () => {
    if (theme === 'light') return 'Açık';
    if (theme === 'dark') return 'Koyu';
    return 'Sistem';
  };

  return (
    <button
      onClick={cycleTheme}
      className="relative flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-all duration-300 group overflow-hidden border border-transparent hover:border-neutral-300 dark:hover:border-neutral-600"
      aria-label={`Tema Değiştir: ${getThemeLabel()}`}
      title={`Tema: ${getThemeLabel()}`}
    >
      <div className="relative w-5 h-5 flex items-center justify-center animate-in zoom-in duration-300">
        {getThemeIcon()}
      </div>
      <span className="text-xs font-bold uppercase tracking-wider hidden md:block">
        {getThemeLabel()}
      </span>
      
      {/* Subtle background glow on hover */}
      <span className="absolute inset-0 bg-gradient-to-tr from-transparent via-neutral-200/30 to-transparent dark:via-neutral-700/30 opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
  );
}
