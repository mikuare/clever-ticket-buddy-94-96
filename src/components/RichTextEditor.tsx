
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Bold, Italic, Underline, List, AlignLeft, AlignCenter, AlignRight, Smile } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const RichTextEditor = ({ value, onChange, placeholder }: RichTextEditorProps) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  
  // Comprehensive emoji list organized by categories
  const emojiCategories = {
    'Smileys & People': [
      '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
      '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
      '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩',
      '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
      '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬',
      '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗'
    ],
    'Gestures & Body': [
      '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '👊', '✊', '🤛',
      '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💪', '🦾',
      '👋', '🤚', '🖐', '✋', '🖖', '👉', '👈', '👆', '👇', '☝️'
    ],
    'Hearts & Love': [
      '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
      '❣️', '💕', '💖', '💗', '💘', '💝', '💟', '💌', '💋', '💒'
    ],
    'Activities & Objects': [
      '🔥', '💯', '💫', '⭐', '🌟', '✨', '⚡', '💥', '💦', '💨',
      '🎉', '🎊', '🎈', '🎁', '🏆', '🥇', '🥈', '🥉', '🏅', '🎗️',
      '🎯', '🎪', '🎨', '🎭', '🎪', '🎤', '🎧', '🎵', '🎶', '🎼'
    ],
    'Nature & Weather': [
      '☀️', '🌤', '⛅', '🌦', '🌧', '⛈', '🌩', '🌨', '❄️', '☃️',
      '⛄', '🌪', '🌈', '🌊', '💧', '🔥', '🌍', '🌎', '🌏', '🌕',
      '🌙', '⭐', '🌟', '💫', '✨', '☄️', '🌠', '🌌', '🌃', '🌆'
    ],
    'Food & Drink': [
      '🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍈', '🍒', '🍑',
      '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒',
      '🌶', '🌽', '🥕', '🧄', '🧅', '🥔', '🍠', '🥐', '🍞', '🥖'
    ]
  };

  const allEmojis = Object.values(emojiCategories).flat();

  const applyFormat = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const insertEmoji = (emoji: string) => {
    if (editorRef.current) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        range.insertNode(document.createTextNode(emoji));
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
      } else {
        // If no selection, append to the end
        editorRef.current.innerHTML += emoji;
      }
      onChange(editorRef.current.innerHTML);
    }
    setShowEmojiPicker(false);
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  return (
    <div className="border border-border rounded-lg bg-background">
      <div className="flex flex-wrap gap-1 p-2 border-b border-border bg-muted/50">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => applyFormat('bold')}
        >
          <Bold className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => applyFormat('italic')}
        >
          <Italic className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => applyFormat('underline')}
        >
          <Underline className="w-4 h-4" />
        </Button>
        <div className="w-px h-6 bg-border mx-1" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => applyFormat('insertUnorderedList')}
        >
          <List className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => applyFormat('justifyLeft')}
        >
          <AlignLeft className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => applyFormat('justifyCenter')}
        >
          <AlignCenter className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => applyFormat('justifyRight')}
        >
          <AlignRight className="w-4 h-4" />
        </Button>
        <div className="w-px h-6 bg-border mx-1" />
        <div className="relative">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            <Smile className="w-4 h-4" />
          </Button>
          {showEmojiPicker && (
            <div className="absolute top-8 left-0 bg-background border border-border rounded-lg p-4 shadow-lg z-20 max-h-80 overflow-y-auto">
              <div className="w-80">
                {Object.entries(emojiCategories).map(([category, emojis]) => (
                  <div key={category} className="mb-4">
                    <h4 className="text-xs font-semibold text-muted-foreground mb-2">{category}</h4>
                    <div className="grid grid-cols-10 gap-1">
                      {emojis.map((emoji, index) => (
                        <button
                          key={`${category}-${index}`}
                          type="button"
                          className="p-1 hover:bg-muted rounded text-lg w-8 h-8 flex items-center justify-center transition-colors"
                          onClick={() => insertEmoji(emoji)}
                          title={emoji}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <div
        ref={editorRef}
        contentEditable
        className="p-3 min-h-[120px] outline-none focus:ring-2 focus:ring-primary focus:ring-inset bg-background text-foreground"
        style={{ 
          direction: 'ltr',
          textAlign: 'left',
          unicodeBidi: 'plaintext'
        }}
        onInput={handleInput}
        data-placeholder={placeholder}
        suppressContentEditableWarning={true}
      />
      <style dangerouslySetInnerHTML={{
        __html: `
          [contenteditable]:empty:before {
            content: attr(data-placeholder);
            color: hsl(var(--muted-foreground));
            pointer-events: none;
          }
        `
      }} />
    </div>
  );
};

export default RichTextEditor;
