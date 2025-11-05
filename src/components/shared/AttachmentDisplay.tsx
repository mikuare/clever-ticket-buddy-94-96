
import { Download, Image as ImageIcon, File } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getAttachmentsArray, downloadFile, type AttachmentFile } from '@/utils/attachmentUtils';
import type { Json } from '@/integrations/supabase/types';

interface AttachmentDisplayProps {
  attachments: Json;
  className?: string;
}

const AttachmentDisplay = ({ attachments, className = "" }: AttachmentDisplayProps) => {
  const attachmentFiles = getAttachmentsArray(attachments);

  if (attachmentFiles.length === 0) {
    return null;
  }

  return (
    <div className={`border-t pt-3 ${className}`}>
      <h4 className="text-sm font-medium text-gray-700 mb-2">
        Attachments ({attachmentFiles.length})
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {attachmentFiles.map((attachment: AttachmentFile, index: number) => (
          <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border">
            {attachment.type?.startsWith('image/') ? (
              <div className="flex items-center gap-2 flex-1">
                <ImageIcon className="w-4 h-4 text-blue-500" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{attachment.name}</p>
                  <img 
                    src={attachment.url} 
                    alt={attachment.name}
                    className="mt-1 max-h-16 max-w-full object-cover rounded cursor-pointer"
                    onClick={() => window.open(attachment.url, '_blank')}
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 flex-1">
                <File className="w-4 h-4 text-gray-500" />
                <span className="text-xs flex-1 truncate">{attachment.name}</span>
              </div>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => downloadFile(attachment.url, attachment.name)}
              className="h-6 w-6 p-0 flex-shrink-0"
            >
              <Download className="w-3 h-3" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AttachmentDisplay;
