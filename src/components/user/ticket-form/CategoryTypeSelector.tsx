
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useConfigurationData } from '@/hooks/useConfigurationData';

interface CategoryTypeSelectorProps {
  value: string;
  onChange: (value: string) => void;
  selectedClassificationName: string;
  show: boolean;
}

const CategoryTypeSelector = ({ value, onChange, selectedClassificationName, show }: CategoryTypeSelectorProps) => {
  const { getClassificationByName, getCategoriesForClassification, loading } = useConfigurationData();

  if (!show || loading) return null;

  const classification = getClassificationByName(selectedClassificationName);
  if (!classification) {
    console.log('Classification not found:', selectedClassificationName);
    return null;
  }

  const availableCategories = getCategoriesForClassification(classification.id);
  console.log('Available categories for', selectedClassificationName, ':', availableCategories);
  
  // Don't show if only one category and it's "Default"
  if (availableCategories.length === 1 && availableCategories[0].name === 'Default') {
    return null;
  }

  const handleValueChange = (selectedValue: string) => {
    console.log('Category selected:', selectedValue);
    onChange(selectedValue);
  };

  return (
    <div>
      <Label htmlFor="categoryType">Category Type *</Label>
      <Select onValueChange={handleValueChange} value={value}>
        <SelectTrigger>
          <SelectValue placeholder="Select a category type" />
        </SelectTrigger>
        <SelectContent>
          {availableCategories.map((category) => (
            <SelectItem key={category.id} value={category.name}>
              {category.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default CategoryTypeSelector;
