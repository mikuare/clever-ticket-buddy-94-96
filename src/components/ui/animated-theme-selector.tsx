
import { useState } from 'react';
import { Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';

const AnimatedThemeSelector = () => {
  const { theme, nextTheme } = useTheme();
  const [isRotating, setIsRotating] = useState(false);

  const createRipple = (e: React.MouseEvent<HTMLButtonElement>) => {
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const ripple = document.createElement('div');
    
    ripple.classList.add('theme-ripple');
    ripple.style.width = size + 'px';
    ripple.style.height = size + 'px';
    ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
    ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
    
    button.appendChild(ripple);
    
    setTimeout(() => {
      ripple.remove();
    }, 600);
  };

  const handleThemeToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    createRipple(e);
    setIsRotating(true);
    
    // Add rotation animation
    setTimeout(() => {
      nextTheme();
    }, 100);
    
    // Remove rotation class after animation
    setTimeout(() => {
      setIsRotating(false);
    }, 800);
  };

  const getThemeInfo = () => {
    switch (theme) {
      case 'maroon':
        return { name: 'Maroon', icon: '🍷', description: 'Rich & elegant' };
      case 'yellow':
        return { name: 'Sunny', icon: '🌻', description: 'Warm & vibrant' };
      case 'blue':
        return { name: 'Ocean', icon: '🌊', description: 'Cool & calming' };
      case 'green':
        return { name: 'Forest', icon: '🌲', description: 'Fresh & natural' };
      case 'dimdark':
        return { name: 'Dim Dark', icon: '🌒', description: 'Soft & subdued' };
      case 'camo':
        return { name: 'Camo', icon: '🪖', description: 'Tactical & stealthy' };
      default:
        return { name: 'Maroon', icon: '🍷', description: 'Rich & elegant' };
    }
  };

  const themeInfo = getThemeInfo();

  return (
    <div className="flex items-center gap-3">
      <div className="hidden md:flex flex-col items-end text-sm">
        <span className="font-medium text-foreground">{themeInfo.name}</span>
        <span className="text-xs text-muted-foreground">{themeInfo.description}</span>
      </div>
      
      <button
        onClick={handleThemeToggle}
        className={`circular-theme-toggle group ${isRotating ? 'theme-toggle-rotating' : ''}`}
        aria-label={`Switch to next theme (current: ${themeInfo.name})`}
        title={`Current theme: ${themeInfo.name} - Click to cycle through themes`}
      >
        <div className="theme-toggle-inner">
          <div className="theme-icon"></div>
        </div>
      </button>
      
      {/* Alternative compact version for mobile */}
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleThemeToggle}
        className="md:hidden button-hover-scale"
      >
        <Palette className="w-4 h-4 mr-1" />
        {themeInfo.name}
      </Button>
    </div>
  );
};

export default AnimatedThemeSelector;
