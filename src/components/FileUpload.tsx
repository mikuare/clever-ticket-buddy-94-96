
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X, FileText, Image } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface FileUploadProps {
  onFilesChange: (files: any[]) => void;
  maxFiles?: number;
  acceptedTypes?: string[];
}

const FileUpload = ({ onFilesChange, maxFiles = 5, acceptedTypes = ['image/*', '.pdf', '.doc', '.docx', '.txt', '.xlsx', '.xls'] }: FileUploadProps) => {
  const [files, setFiles] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    
    if (files.length + selectedFiles.length > maxFiles) {
      toast({
        title: "Too many files",
        description: `Maximum ${maxFiles} files allowed`,
        variant: "destructive"
      });
      return;
    }

    const validFiles = selectedFiles.filter(file => {
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
      
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
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
      setUploading(true);
      const uploadedFiles = [];

      for (const file of validFiles) {
        try {
          const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${file.name}`;
          const { data, error } = await supabase.storage
            .from('ticket-attachments')
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

          // Get the public URL for the uploaded file
          const { data: { publicUrl } } = supabase.storage
            .from('ticket-attachments')
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

      const newFiles = [...files, ...uploadedFiles];
      setFiles(newFiles);
      onFilesChange(newFiles);
      setUploading(false);

      if (uploadedFiles.length > 0) {
        toast({
          title: "Files uploaded",
          description: `${uploadedFiles.length} file(s) uploaded successfully`
        });
      }
    }
  };

  const removeFile = async (index: number) => {
    const fileToRemove = files[index];
    
    // Delete from Supabase storage
    if (fileToRemove.path) {
      const { error } = await supabase.storage
        .from('ticket-attachments')
        .remove([fileToRemove.path]);
      
      if (error) {
        console.error('Delete error:', error);
      }
    }

    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    onFilesChange(newFiles);
  };

  const getFileIcon = (file: any) => {
    if (file.type && file.type.startsWith('image/')) {
      return <Image className="w-4 h-4" />;
    }
    return <FileText className="w-4 h-4" />;
  };

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-600 mb-2">Drop files here or click to upload</p>
        <input
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileSelect}
          className="hidden"
          id="file-upload"
          disabled={uploading}
        />
        <Button variant="outline" asChild disabled={uploading}>
          <label htmlFor="file-upload" className="cursor-pointer">
            {uploading ? 'Uploading...' : 'Choose Files'}
          </label>
        </Button>
        <p className="text-xs text-gray-500 mt-2">
          Max {maxFiles} files, 10MB each. Supported: Images, PDF, DOC, TXT, Excel
        </p>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium">Attached Files ({files.length})</h4>
          {files.map((file, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <div className="flex items-center gap-2">
                {getFileIcon(file)}
                <span className="text-sm truncate">{file.name}</span>
                <span className="text-xs text-gray-500">
                  ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeFile(index)}
                disabled={uploading}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
