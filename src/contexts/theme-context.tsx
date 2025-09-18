'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  actualTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('system');
  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Load theme preference from localStorage
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    const updateTheme = () => {
      let newActualTheme: 'light' | 'dark';
      
      if (theme === 'system') {
        newActualTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      } else {
        newActualTheme = theme;
      }
      
      setActualTheme(newActualTheme);
      
      // Apply theme to document
      const root = document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(newActualTheme);
      
      // Store theme preference
      localStorage.setItem('theme', theme);
    };

    updateTheme();

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        updateTheme();
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  const value = {
    theme,
    actualTheme,
    setTheme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
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

// Hook para detectar se o tema atual é escuro
export function useIsDark() {
  const { actualTheme } = useTheme();
  return actualTheme === 'dark';
}

// Hook para obter classes CSS baseadas no tema
export function useThemeClasses() {
  const { actualTheme } = useTheme();
  
  return {
    bg: actualTheme === 'dark' ? 'bg-gray-900' : 'bg-white',
    bgSecondary: actualTheme === 'dark' ? 'bg-gray-800' : 'bg-gray-50',
    text: actualTheme === 'dark' ? 'text-white' : 'text-gray-900',
    textSecondary: actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-600',
    textMuted: actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500',
    border: actualTheme === 'dark' ? 'border-gray-700' : 'border-gray-200',
    hover: actualTheme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100',
    ring: 'ring-blue-500',
  };
}