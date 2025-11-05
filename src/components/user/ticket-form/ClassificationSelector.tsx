
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useConfigurationData } from '@/hooks/useConfigurationData';

interface ClassificationSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const ClassificationSelector = ({ value, onChange }: ClassificationSelectorProps) => {
  const { classifications, loading } = useConfigurationData();

  if (loading) {
    return (
      <div>
        <Label htmlFor="classification">Classifications *</Label>
        <Select disabled>
          <SelectTrigger>
            <SelectValue placeholder="Loading classifications..." />
          </SelectTrigger>
        </Select>
      </div>
    );
  }

  const handleValueChange = (selectedValue: string) => {
    console.log('Classification selected:', selectedValue);
    onChange(selectedValue);
  };

  return (
    <div>
      <Label htmlFor="classification">Classifications *</Label>
      <Select onValueChange={handleValueChange} value={value}>
        <SelectTrigger>
          <SelectValue placeholder="Select a classification" />
        </SelectTrigger>
        <SelectContent>
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

export default ClassificationSelector;
