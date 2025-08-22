
import { Label } from '@/components/ui/label';
import FileUpload from '@/components/FileUpload';

interface AttachmentUploadProps {
  onFilesChange: (files: any[]) => void;
}

const AttachmentUpload = ({ onFilesChange }: AttachmentUploadProps) => {
  return (
    <div>
      <Label>Attachments</Label>
      <FileUpload onFilesChange={onFilesChange} />
    </div>
  );
};

export default AttachmentUpload;
