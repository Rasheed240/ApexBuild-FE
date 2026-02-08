import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export const ThemeToggle = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border
        border-gray-200 dark:border-gray-600
        bg-white dark:bg-gray-700
        text-gray-600 dark:text-gray-300
        hover:bg-gray-50 dark:hover:bg-gray-600
        hover:border-gray-300 dark:hover:border-gray-500
        transition-all duration-200 shadow-sm text-sm font-medium"
    >
      {isDark
        ? <><Sun className="h-4 w-4 text-amber-400" /><span className="hidden sm:inline">Light</span></>
        : <><Moon className="h-4 w-4 text-indigo-500" /><span className="hidden sm:inline">Dark</span></>
      }
    </button>
  );
};
