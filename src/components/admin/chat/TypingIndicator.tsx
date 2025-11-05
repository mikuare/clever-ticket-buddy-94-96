
import { Loader2 } from 'lucide-react';
import type { TypingStatus } from '@/types/admin';

interface TypingIndicatorProps {
  typingUsers: TypingStatus[];
  currentUserId?: string;
}

const TypingIndicator = ({ typingUsers, currentUserId }: TypingIndicatorProps) => {
  // Filter out current user and only show active typers
  const activeTypers = typingUsers.filter(
    user => user.user_id !== currentUserId && user.is_typing
  );

  console.log('🎨 TypingIndicator render:', {
    totalTypingUsers: typingUsers.length,
    activeTypers: activeTypers.length,
    currentUserId,
    typingUsers: typingUsers.map(u => ({ name: u.user_name, id: u.user_id, typing: u.is_typing }))
  });

  if (activeTypers.length === 0) return null;

  const getTypingText = () => {
    if (activeTypers.length === 1) {
      return `${activeTypers[0].user_name} is typing`;
    } else if (activeTypers.length === 2) {
      return `${activeTypers[0].user_name} and ${activeTypers[1].user_name} are typing`;
    } else {
      return `${activeTypers[0].user_name} and ${activeTypers.length - 1} others are typing`;
    }
  };

  return (
    <div className="px-2 md:px-4 py-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center gap-2 text-sm text-primary px-4 py-3 bg-primary/10 rounded-lg border border-primary/20 shadow-sm">
        <Loader2 className="w-4 h-4 animate-spin text-primary" />
        <span className="font-medium">{getTypingText()}</span>
        <span className="flex gap-1 ml-1">
          <span className="inline-block w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
          <span className="inline-block w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
          <span className="inline-block w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
        </span>
      </div>
    </div>
  );
};

export default TypingIndicator;

