'use client';

import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '@/contexts/theme-context';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
  variant?: 'button' | 'dropdown';
}

export function ThemeToggle({ 
  className = '', 
  showLabel = false, 
  variant = 'button' 
}: ThemeToggleProps) {
  const { theme, setTheme, toggleTheme, actualTheme } = useTheme();

  const getThemeIcon = (themeType: string) => {
    switch (themeType) {
      case 'light':
        return <Sun className="h-4 w-4" />;
      case 'dark':
        return <Moon className="h-4 w-4" />;
      case 'system':
        return <Monitor className="h-4 w-4" />;
      default:
        return <Sun className="h-4 w-4" />;
    }
  };

  const getThemeLabel = (themeType: string) => {
    switch (themeType) {
      case 'light':
        return 'Claro';
      case 'dark':
        return 'Escuro';
      case 'system':
        return 'Sistema';
      default:
        return 'Claro';
    }
  };

  if (variant === 'dropdown') {
    return (
      <div className={`relative ${className}`}>
        <div className="space-y-1">
          {(['light', 'dark', 'system'] as const).map((themeOption) => (
            <button
              key={themeOption}
              onClick={() => setTheme(themeOption)}
              className={`flex items-center w-full px-3 py-2 text-sm rounded-lg transition-colors ${
                theme === themeOption
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100'
                  : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <span className="mr-3">{getThemeIcon(themeOption)}</span>
              <span>{getThemeLabel(themeOption)}</span>
              {theme === themeOption && (
                <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className={`p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors ${className}`}
      aria-label={`Alternar tema (atual: ${getThemeLabel(theme)})`}
      title={`Tema atual: ${getThemeLabel(theme)} (${actualTheme === 'dark' ? 'escuro' : 'claro'})`}
    >
      <div className="relative">
        {getThemeIcon(theme)}
        {theme === 'system' && (
          <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-blue-500 rounded-full border border-white dark:border-gray-800" />
        )}
      </div>
      {showLabel && (
        <span className="ml-2 text-sm font-medium">
          {getThemeLabel(theme)}
        </span>
      )}
    </button>
  );
}

// Componente simplificado para uso rápido
export function SimpleThemeToggle({ className = '' }: { className?: string }) {
  const { actualTheme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors ${className}`}
      aria-label="Alternar tema"
    >
      {actualTheme === 'dark' ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </button>
  );
}

// Componente para configurações com todas as opções
export function ThemeSelector({ className = '' }: { className?: string }) {
  const { theme, setTheme } = useTheme();

  return (
    <div className={`space-y-3 ${className}`}>
      <h3 className="text-sm font-medium text-gray-900 dark:text-white">
        Tema da Interface
      </h3>
      <div className="grid grid-cols-3 gap-2">
        {(['light', 'dark', 'system'] as const).map((themeOption) => (
          <button
            key={themeOption}
            onClick={() => setTheme(themeOption)}
            className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all ${
              theme === themeOption
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <div className={`mb-2 ${
              theme === themeOption ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'
            }`}>
              {getThemeIcon(themeOption)}
            </div>
            <span className={`text-xs font-medium ${
              theme === themeOption ? 'text-blue-900 dark:text-blue-100' : 'text-gray-700 dark:text-gray-300'
            }`}>
              {getThemeLabel(themeOption)}
            </span>
          </button>
        ))}
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        O tema &quot;Sistema&quot; segue a preferência do seu dispositivo
      </p>
    </div>
  );

  function getThemeIcon(themeType: string) {
    switch (themeType) {
      case 'light':
        return <Sun className="h-5 w-5" />;
      case 'dark':
        return <Moon className="h-5 w-5" />;
      case 'system':
        return <Monitor className="h-5 w-5" />;
      default:
        return <Sun className="h-5 w-5" />;
    }
  }

  function getThemeLabel(themeType: string) {
    switch (themeType) {
      case 'light':
        return 'Claro';
      case 'dark':
        return 'Escuro';
      case 'system':
        return 'Sistema';
      default:
        return 'Claro';
    }
  }
}