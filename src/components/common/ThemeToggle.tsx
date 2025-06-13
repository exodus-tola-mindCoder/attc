import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, Monitor, ChevronDown } from 'lucide-react';

interface ThemeToggleProps {
  variant?: 'button' | 'dropdown';
  size?: 'sm' | 'md' | 'lg';
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ variant = 'button', size = 'md' }) => {
  const { theme, actualTheme, setTheme, toggleTheme } = useTheme();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const getIcon = (themeName: string, isActive: boolean = false) => {
    const iconSize = size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-6 w-6' : 'h-5 w-5';
    const iconClass = `${iconSize} ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`;

    switch (themeName) {
      case 'light':
        return <Sun className={iconClass} />;
      case 'dark':
        return <Moon className={iconClass} />;
      case 'system':
        return <Monitor className={iconClass} />;
      default:
        return actualTheme === 'dark' ? <Moon className={iconClass} /> : <Sun className={iconClass} />;
    }
  };

  const getThemeLabel = (themeName: string) => {
    switch (themeName) {
      case 'light':
        return 'Light';
      case 'dark':
        return 'Dark';
      case 'system':
        return 'System';
      default:
        return 'Theme';
    }
  };

  if (variant === 'button') {
    return (
      <button
        onClick={toggleTheme}
        className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors duration-200"
        title={`Switch to ${actualTheme === 'light' ? 'dark' : 'light'} mode`}
      >
        {getIcon(actualTheme)}
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center space-x-2 p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors duration-200"
      >
        {getIcon(theme)}
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {getThemeLabel(theme)}
        </span>
        <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
      </button>

      {isDropdownOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsDropdownOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20">
            <div className="py-1">
              {(['light', 'dark', 'system'] as const).map((themeName) => (
                <button
                  key={themeName}
                  onClick={() => {
                    setTheme(themeName);
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${theme === themeName ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                >
                  {getIcon(themeName, theme === themeName)}
                  <span className={`text-sm ${theme === themeName
                      ? 'text-blue-600 dark:text-blue-400 font-medium'
                      : 'text-gray-700 dark:text-gray-300'
                    }`}>
                    {getThemeLabel(themeName)}
                  </span>
                  {themeName === 'system' && (
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
                      ({actualTheme})
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ThemeToggle;