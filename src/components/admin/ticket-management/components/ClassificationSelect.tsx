
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Classification } from '@/hooks/useConfigurationData';

interface ClassificationSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  classifications: Classification[];
}

export const ClassificationSelect = ({ 
  value, 
  onValueChange, 
  classifications 
}: ClassificationSelectProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="classification">Classification</Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select classification" />
        </SelectTrigger>
        <SelectContent className="bg-white border shadow-lg max-h-60 overflow-y-auto z-50">
          {classifications.map((classification) => (
            <SelectItem key={classification.id} value={classification.name}>
              {classification.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
