import { useState } from 'react';
import EmojiPickerReact, { EmojiClickData, Theme } from 'emoji-picker-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Smile } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  className?: string;
}

const EmojiPicker = ({ onEmojiSelect, className }: EmojiPickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { theme } = useTheme();

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    onEmojiSelect(emojiData.emoji);
    setIsOpen(false);
  };

  const getEmojiTheme = (): Theme => {
    switch (theme) {
      case 'dimdark':
        return Theme.DARK;
      default:
        return Theme.LIGHT;
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={className}
        >
          <Smile className="w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-auto p-0 border-0 shadow-lg"
        align="end"
        side="top"
      >
        <EmojiPickerReact
          onEmojiClick={handleEmojiClick}
          theme={getEmojiTheme()}
          height={400}
          width={320}
          searchDisabled={false}
          skinTonesDisabled={false}
          previewConfig={{
            showPreview: false
          }}
        />
      </PopoverContent>
    </Popover>
  );
};

export default EmojiPicker;