
import type { Json } from '@/integrations/supabase/types';

export interface AttachmentFile {
  name: string;
  url: string;
  path?: string;
  size?: number;
  type?: string;
}

const isAttachmentFile = (item: any): item is AttachmentFile => {
  return item && 
         typeof item === 'object' && 
         typeof item.name === 'string' && 
         typeof item.url === 'string';
};

export const getAttachmentsArray = (attachments: Json): AttachmentFile[] => {
  if (!attachments) return [];
  
  // Handle case where attachments is directly an array of files
  if (Array.isArray(attachments)) {
    return (attachments as any[]).filter(isAttachmentFile);
  }
  
  // Handle case where attachments is an object with various properties
  if (typeof attachments === 'object' && attachments !== null) {
    const attachmentObj = attachments as Record<string, any>;
    
    // Check if it has a direct array of files
    if (Array.isArray(attachmentObj.files)) {
      return attachmentObj.files.filter(isAttachmentFile);
    }
    
    // Check if the root level contains file properties
    if (isAttachmentFile(attachmentObj)) {
      return [attachmentObj];
    }
    
    // Look for any array property that might contain files
    for (const key of Object.keys(attachmentObj)) {
      const value = attachmentObj[key];
      if (Array.isArray(value) && value.length > 0 && isAttachmentFile(value[0])) {
        return value.filter(isAttachmentFile);
      }
    }
    
    // Check if the object itself has the structure we expect from FileUpload
    const entries = Object.entries(attachmentObj);
    const fileEntries = entries.filter(([key, value]) => isAttachmentFile(value));
    
    if (fileEntries.length > 0) {
      return fileEntries.map(([, value]) => value as AttachmentFile);
    }
  }
  
  return [];
};

export const downloadFile = (url: string, name: string) => {
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.target = '_blank';
  // Add rel="noopener noreferrer" for security
  link.rel = 'noopener noreferrer';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
