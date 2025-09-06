
import { Label } from '@/components/ui/label';
import RichTextEditor from '@/components/RichTextEditor';

interface DescriptionEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const DescriptionEditor = ({ value, onChange }: DescriptionEditorProps) => {
  return (
    <div>
      <Label htmlFor="description">Description *</Label>
      <RichTextEditor
        value={value}
        onChange={onChange}
        placeholder="Detailed description of the issue..."
      />
    </div>
  );
};

export default DescriptionEditor;
