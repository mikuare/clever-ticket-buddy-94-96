
import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Paperclip, Mic } from 'lucide-react';
import ChatFileUpload from './ChatFileUpload';
import FilePreview from './FilePreview';
import EmojiPicker from '@/components/shared/EmojiPicker';
import AudioRecorder from '@/components/shared/AudioRecorder';
import { useToast } from '@/hooks/use-toast';

interface MessageInputProps {
  onSendMessage: (message: string, attachments?: any[], audioBlob?: Blob) => Promise<void>;
  loading: boolean;
}

const MessageInput = ({ onSendMessage, loading }: MessageInputProps) => {
  const [newMessage, setNewMessage] = useState('');
  const [attachments, setAttachments] = useState<any[]>([]);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [showAudioRecorder, setShowAudioRecorder] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  const handleSend = async (audioBlob?: Blob) => {
    if (!newMessage.trim() && attachments.length === 0 && !audioBlob) return;
    
    // Clear input immediately for better UX
    const messageToSend = audioBlob 
      ? 'Audio message' 
      : newMessage.trim() || 'File attachment';
    const attachmentsToSend = [...attachments];
    
    setNewMessage('');
    setAttachments([]);
    setShowFileUpload(false);
    setShowAudioRecorder(false);
    
    // Send message after clearing input
    await onSendMessage(messageToSend, attachmentsToSend, audioBlob);
  };

  const processFiles = useCallback(async (files: FileList) => {
    const maxFiles = 3;
    const acceptedTypes = ['image/*', '.pdf', '.doc', '.docx', '.txt'];
    
    if (attachments.length + files.length > maxFiles) {
      toast({
        title: "Too many files",
        description: `Maximum ${maxFiles} files allowed`,
        variant: "destructive"
      });
      return;
    }

    const validFiles = Array.from(files).filter(file => {
      const isValidType = acceptedTypes.some(type => {
        if (type.includes('*')) {
          return file.type.startsWith(type.replace('*', ''));
        }
        return file.name.toLowerCase().endsWith(type);
      });
      
      if (!isValidType) {
        toast({
          title: "Invalid file type",
          description: `File ${file.name} is not supported`,
          variant: "destructive"
        });
        return false;
      }
      
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `File ${file.name} exceeds 10MB limit`,
          variant: "destructive"
        });
        return false;
      }
      
      return true;
    });

    if (validFiles.length > 0) {
      // Import supabase client
      const { supabase } = await import('@/integrations/supabase/client');
      const uploadedFiles = [];

      for (const file of validFiles) {
        try {
          const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${file.name}`;
          const { data, error } = await supabase.storage
            .from('chat-attachments')
            .upload(fileName, file);

          if (error) {
            console.error('Upload error:', error);
            toast({
              title: "Upload failed",
              description: `Failed to upload ${file.name}`,
              variant: "destructive"
            });
            continue;
          }

          const { data: { publicUrl } } = supabase.storage
            .from('chat-attachments')
            .getPublicUrl(data.path);

          uploadedFiles.push({
            name: file.name,
            path: data.path,
            size: file.size,
            type: file.type,
            url: publicUrl
          });
        } catch (error) {
          console.error('Upload error:', error);
          toast({
            title: "Upload failed",
            description: `Failed to upload ${file.name}`,
            variant: "destructive"
          });
        }
      }

      if (uploadedFiles.length > 0) {
        setAttachments(prev => [...prev, ...uploadedFiles]);
        toast({
          title: "Files uploaded",
          description: `${uploadedFiles.length} file(s) uploaded successfully`
        });
      }
    }
  }, [attachments.length, toast]);

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFiles(files);
    }
  }, [processFiles]);

  // Paste handler for images
  const handlePaste = useCallback(async (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    const files: File[] = [];
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.indexOf('image') !== -1) {
        const file = item.getAsFile();
        if (file) {
          files.push(file);
        }
      }
    }
    
    if (files.length > 0) {
      e.preventDefault();
      const fileList = new DataTransfer();
      files.forEach(file => fileList.items.add(file));
      await processFiles(fileList.files);
    }
  }, [processFiles]);

  const handleAudioReady = (audioBlob: Blob, duration: number) => {
    handleSend(audioBlob);
  };

  const handleEmojiSelect = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div 
      className={`space-y-3 relative ${isDragOver ? 'bg-primary/10 border-2 border-dashed border-primary rounded-lg p-2' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isDragOver && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-primary/5 rounded-lg">
          <div className="text-center p-4">
            <div className="text-primary font-medium">Drop files here to upload</div>
            <div className="text-sm text-muted-foreground">Supports images, PDFs, and documents</div>
          </div>
        </div>
      )}
      
      {showAudioRecorder && (
        <AudioRecorder
          onAudioReady={handleAudioReady}
          onCancel={() => setShowAudioRecorder(false)}
        />
      )}
      
      {/* File Upload Modal */}
      {showFileUpload && (
        <div className="border rounded-lg p-3 bg-card/50 border-border">
          <ChatFileUpload 
            onFilesChange={setAttachments}
            maxFiles={3}
          />
        </div>
      )}

      {/* File Preview */}
      <FilePreview 
        files={attachments}
        onRemoveFile={(index) => {
          const newAttachments = attachments.filter((_, i) => i !== index);
          setAttachments(newAttachments);
        }}
        className={attachments.length > 0 ? "mb-3" : ""}
      />
      
      <div className="flex gap-2 items-end">
        <div className="flex gap-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowFileUpload(!showFileUpload)}
            className="flex-shrink-0"
            disabled={showAudioRecorder}
          >
            <Paperclip className="w-4 h-4" />
          </Button>
          
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowAudioRecorder(!showAudioRecorder)}
            className="flex-shrink-0"
            disabled={showFileUpload}
          >
            <Mic className="w-4 h-4" />
          </Button>
          
          <EmojiPicker
            onEmojiSelect={handleEmojiSelect}
            className="flex-shrink-0"
          />
        </div>
        
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            onPaste={handlePaste}
            placeholder="Type your message... (Press Enter to send, Shift+Enter for new line, Ctrl+V to paste images, or drag & drop files)"
            className="resize-none pr-12 min-h-[40px] max-h-[120px]"
            rows={1}
          />
          <Button
            onClick={() => handleSend()}
            disabled={(!newMessage.trim() && attachments.length === 0) || loading || showAudioRecorder}
            size="sm"
            className="absolute right-2 top-2 h-6 w-6 p-0"
          >
            <Send className="w-3 h-3" />
          </Button>
        </div>
      </div>
      
    </div>
  );
};

export default MessageInput;
