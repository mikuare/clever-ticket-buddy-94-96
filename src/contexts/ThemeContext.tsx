
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Theme = 'maroon' | 'dimdark' | 'yellow' | 'blue' | 'green' | 'camo';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  nextTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>('yellow');

  useEffect(() => {
    const savedTheme = localStorage.getItem('app-theme') as Theme;
    if (savedTheme && ['maroon', 'dimdark', 'yellow', 'blue', 'green', 'camo'].includes(savedTheme)) {
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

  const nextTheme = () => {
    const themes: Theme[] = ['maroon', 'yellow', 'blue', 'green', 'dimdark', 'camo'];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, nextTheme }}>
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
