'use client';

import { Moon, Sparkles, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    // Default to dark mode if no preference is saved
    const initialTheme = savedTheme || 'dark';
    
    setTheme(initialTheme);
    applyTheme(initialTheme);
  }, []);

  const applyTheme = (newTheme: 'light' | 'dark') => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(newTheme);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
  };

  if (!mounted) {
    return (
      <div className="w-12 h-6 rounded-full bg-background-elevated border border-border animate-pulse" />
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className={`relative w-12 h-6 rounded-full border border-border transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
        theme === 'dark' ? 'bg-background-elevated' : 'bg-background-tertiary'
      }`}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
      <div
        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full shadow-md transform transition-transform duration-200 flex items-center justify-center ${
          theme === 'dark'
            ? 'translate-x-6 bg-slate-800'
            : 'translate-x-0 bg-white'
        }`}>
        {theme === 'dark' ? (
          <Moon className="h-3 w-3 text-slate-200" />
        ) : (
          <Sun className="h-3 w-3 text-yellow-500" />
        )}
      </div>
    </button>
  );
}

