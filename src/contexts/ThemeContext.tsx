
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Theme = 'maroon' | 'dimdark' | 'yellow' | 'blue' | 'green' | 'camo';

export const AVAILABLE_THEMES: Theme[] = ['maroon', 'yellow', 'blue', 'green', 'dimdark', 'camo'];

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>('yellow');

  useEffect(() => {
    const savedTheme = localStorage.getItem('app-theme') as Theme | null;
    if (savedTheme && AVAILABLE_THEMES.includes(savedTheme)) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('app-theme', theme);
    
    // Apply theme to document
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    
    // Remove existing theme classes
    root.classList.remove('theme-maroon', 'theme-dimdark', 'theme-yellow', 'theme-blue', 'theme-green', 'theme-camo');
    root.classList.add(`theme-${theme}`);
    
    // Update body background for cosmic theme integration
    document.body.style.background = 'transparent';
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
