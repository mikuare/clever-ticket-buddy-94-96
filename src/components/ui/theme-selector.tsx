
import { Palette } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AVAILABLE_THEMES, Theme, useTheme } from '@/contexts/ThemeContext';

const THEME_META: Record<Theme, { name: string; icon: string }> = {
  maroon: { name: 'Maroon', icon: '🍷' },
  yellow: { name: 'Sunny', icon: '🌻' },
  blue: { name: 'Ocean', icon: '🌊' },
  green: { name: 'Forest', icon: '🌲' },
  dimdark: { name: 'Dim Dark', icon: '🌒' },
  camo: { name: 'Camo', icon: '🪖' }
};

const ThemeSelector = () => {
  const { theme, setTheme } = useTheme();
  const themeInfo = THEME_META[theme];

  const handleThemeChange = (value: string) => {
    setTheme(value as Theme);
  };

  return (
    <div className="flex items-center gap-3">
      <Select value={theme} onValueChange={handleThemeChange}>
        <SelectTrigger className="w-44 md:w-56">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-muted-foreground" />
            <SelectValue placeholder="Choose a theme" />
          </div>
        </SelectTrigger>
        <SelectContent className="bg-popover border-border">
          {AVAILABLE_THEMES.map((value) => {
            const option = THEME_META[value];
            return (
              <SelectItem key={value} value={value} className="py-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{option.icon}</span>
                  <span className="font-medium">{option.name}</span>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ThemeSelector;
