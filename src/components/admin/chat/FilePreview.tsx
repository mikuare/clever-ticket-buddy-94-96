import { X, FileText, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface FilePreviewProps {
  files: Array<{
    name: string;
    url: string;
    size: number;
    type: string;
  }>;
  onRemoveFile: (index: number) => void;
  className?: string;
}

const FilePreview = ({ files, onRemoveFile, className = "" }: FilePreviewProps) => {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isImage = (type: string) => type.startsWith('image/');

  if (files.length === 0) return null;

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-foreground">
          Files to send ({files.length})
        </h4>
        <Badge variant="secondary" className="text-xs">
          Ready to send
        </Badge>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {files.map((file, index) => (
          <Card key={index} className="relative group hover:shadow-md transition-shadow">
            <div className="p-3">
              {/* Remove button */}
              <Button
                variant="destructive"
                size="sm"
                className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                onClick={() => onRemoveFile(index)}
              >
                <X className="h-3 w-3" />
              </Button>

              {/* File preview */}
              <div className="aspect-square mb-2 rounded-md overflow-hidden bg-muted flex items-center justify-center">
                {isImage(file.type) ? (
                  <img
                    src={file.url}
                    alt={file.name}
                    className="w-full h-full object-cover rounded-md"
                    onError={(e) => {
                      // Fallback to file icon if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const fallback = target.nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                ) : null}
                
                {/* Fallback for non-images or failed image loads */}
                <div 
                  className={`w-full h-full flex items-center justify-center ${isImage(file.type) ? 'hidden' : 'flex'}`}
                  style={{ display: isImage(file.type) ? 'none' : 'flex' }}
                >
                  <FileText className="w-8 h-8 text-muted-foreground" />
                </div>
              </div>

              {/* File info */}
              <div className="space-y-1">
                <p className="text-xs font-medium text-foreground truncate" title={file.name}>
                  {file.name}
                </p>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => window.open(file.url, '_blank')}
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default FilePreview;