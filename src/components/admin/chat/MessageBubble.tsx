
import { User, UserCheck, Download, Reply, Edit2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import AudioMessage from '@/components/shared/AudioMessage';
import type { TicketMessage } from '@/types/admin';

interface MessageBubbleProps {
  message: TicketMessage;
  isCurrentUser: boolean;
  avatarUrl?: string;
  onReply?: (message: TicketMessage) => void;
  onEdit?: (message: TicketMessage) => void;
  canEdit?: boolean;
  canReply?: boolean;
}

const MessageBubble = ({ 
  message, 
  isCurrentUser, 
  avatarUrl,
  onReply,
  onEdit,
  canEdit = false,
  canReply = true
}: MessageBubbleProps) => {
  const attachments = message.attachments ? 
    (Array.isArray(message.attachments) ? message.attachments : []) : [];

  const downloadFile = (url: string, name: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  console.log('MessageBubble rendering:', {
    messageId: message.id,
    userName: message.user_name,
    isAdmin: message.is_admin,
    isCurrentUser,
    messageContent: message.message,
    hasMessage: !!message.message,
    messageLength: message.message?.length || 0
  });

  // Validate message data
  if (!message.id || !message.user_name) {
    console.error('Invalid message data:', message);
    return (
      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600 text-sm">Error: Invalid message data</p>
      </div>
    );
  }

  return (
    <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-4 group`}>
      <div
        className={`max-w-[70%] rounded-lg p-3 shadow-sm relative ${
          isCurrentUser
            ? 'bg-primary text-primary-foreground'
            : message.is_admin
            ? 'bg-accent text-accent-foreground border border-accent'
            : 'bg-card text-card-foreground border border-border'
        }`}
      >
        <div className="flex items-center gap-2 mb-2">
          <Avatar className="h-6 w-6 ring-2 ring-background/50">
            <AvatarImage src={avatarUrl || ''} alt={message.user_name} />
            <AvatarFallback>{message.user_name?.[0] || 'U'}</AvatarFallback>
          </Avatar>
          <span className="text-xs font-medium flex items-center gap-1">
            {message.user_name}
            {message.is_admin ? (
              <UserCheck className="w-3 h-3 opacity-80" />
            ) : null}
          </span>
          <span className="text-xs opacity-70">
            {new Date(message.created_at).toLocaleTimeString()}
          </span>
          {message.is_edited && (
            <span className="text-xs opacity-60 italic flex items-center gap-1">
              <Check className="w-3 h-3" />
              Edited
            </span>
          )}
        </div>
        
        {/* Reply Context - Show if this message is a reply */}
        {message.replied_message && (
          <div className={`mb-2 p-2 rounded border-l-2 text-xs ${
            isCurrentUser
              ? 'bg-primary-foreground/10 border-primary-foreground/30'
              : 'bg-muted/50 border-muted-foreground/30'
          }`}>
            <div className="font-medium opacity-70 mb-1 flex items-center gap-1">
              <Reply className="w-3 h-3" />
              Replying to {message.replied_message.user_name}
            </div>
            <div className="opacity-80 truncate">
              {message.replied_message.message || '[Audio/Attachment]'}
            </div>
          </div>
        )}
        
        {/* Handle audio messages */}
        {message.audio_url && (
          <div className="mt-3">
            <AudioMessage 
              audioUrl={message.audio_url}
              duration={message.audio_duration}
              isCurrentUser={isCurrentUser}
            />
          </div>
        )}
        
        {message.message && !message.audio_url && (
          <p className="text-sm whitespace-pre-wrap break-words">
            {message.message}
          </p>
        )}
        
        {!message.message && !message.audio_url && attachments.length === 0 && (
          <p className="text-xs italic opacity-70">
            [No message content]
          </p>
        )}

        {attachments.length > 0 && (
          <div className="space-y-2 mt-3">
            {attachments.map((attachment: any, index: number) => (
              <div key={index} className="flex items-center gap-2 p-2 rounded bg-muted/20">
                <div className="flex-1">
                  {attachment.type?.startsWith('image/') ? (
                    <div>
                      <img 
                        src={attachment.url} 
                        alt={attachment.name}
                        className="max-w-[200px] max-h-[150px] object-cover rounded cursor-pointer"
                        onClick={() => window.open(attachment.url, '_blank')}
                      />
                      <p className="text-xs mt-1">{attachment.name}</p>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-xs">{attachment.name}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => downloadFile(attachment.url, attachment.name)}
                        className="h-6 px-2"
                      >
                        <Download className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Action Buttons - Show on hover */}
        <div className={`absolute ${isCurrentUser ? 'left-0 -translate-x-full pl-2' : 'right-0 translate-x-full pr-2'} top-0 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1`}>
          {canReply && onReply && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onReply(message)}
              className="h-6 w-6 p-0"
              title="Reply to this message"
            >
              <Reply className="w-3 h-3" />
            </Button>
          )}
          {canEdit && isCurrentUser && onEdit && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onEdit(message)}
              className="h-6 w-6 p-0"
              title="Edit this message"
            >
              <Edit2 className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
