'use client';

import { useTheme } from 'next-themes';
import { Monitor, Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ThemeOption {
  value: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const themeOptions: ThemeOption[] = [
  {
    value: 'light',
    label: 'Claro',
    description: 'Interface clara e limpa',
    icon: Sun,
  },
  {
    value: 'dark',
    label: 'Escuro',
    description: 'Interface escura para reduzir o cansaço visual',
    icon: Moon,
  },
  {
    value: 'system',
    label: 'Sistema',
    description: 'Segue a configuração do seu dispositivo',
    icon: Monitor,
  },
];

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {themeOptions.map((option) => (
          <div
            key={option.value}
            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg animate-pulse"
          >
            <div className="h-6 w-6 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-1"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {themeOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = theme === option.value;
          
          return (
            <button
              key={option.value}
              onClick={() => setTheme(option.value)}
              className={`p-4 border rounded-lg text-left transition-all duration-200 hover:scale-105 ${
                isSelected
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-500 ring-opacity-20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
              }`}
            >
              <div className="flex items-center space-x-3 mb-2">
                <Icon className={`h-5 w-5 ${
                  isSelected 
                    ? 'text-blue-600 dark:text-blue-400' 
                    : 'text-gray-500 dark:text-gray-400'
                }`} />
                <span className={`font-medium ${
                  isSelected 
                    ? 'text-blue-900 dark:text-blue-100' 
                    : 'text-gray-900 dark:text-white'
                }`}>
                  {option.label}
                </span>
                {isSelected && (
                  <div className="ml-auto">
                    <div className="h-2 w-2 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                  </div>
                )}
              </div>
              <p className={`text-sm ${
                isSelected 
                  ? 'text-blue-700 dark:text-blue-300' 
                  : 'text-gray-600 dark:text-gray-400'
              }`}>
                {option.description}
              </p>
            </button>
          );
        })}
      </div>
      
      <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
        <p className="text-xs text-gray-600 dark:text-gray-400">
          <strong>Tema atual:</strong> {themeOptions.find(opt => opt.value === theme)?.label || 'Carregando...'}
        </p>
      </div>
    </div>
  );
}

export { ThemeSelector as ThemeToggle };