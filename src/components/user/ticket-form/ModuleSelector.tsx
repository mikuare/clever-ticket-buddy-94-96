
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useConfigurationData } from '@/hooks/useConfigurationData';

interface ModuleSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const ModuleSelector = ({ value, onChange }: ModuleSelectorProps) => {
  const { modules, loading } = useConfigurationData();

  if (loading) {
    return (
      <div>
        <Label htmlFor="acumaticaModule">Acumatica Modules</Label>
        <Select disabled>
          <SelectTrigger>
            <SelectValue placeholder="Loading modules..." />
          </SelectTrigger>
        </Select>
      </div>
    );
  }

  return (
    <div>
      <Label htmlFor="acumaticaModule">Acumatica Modules</Label>
      <Select onValueChange={onChange} value={value}>
        <SelectTrigger>
          <SelectValue placeholder="Select an Acumatica module (optional)" />
        </SelectTrigger>
        <SelectContent>
          {modules.map((module) => (
            <SelectItem key={module.id} value={module.name}>
              {module.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ModuleSelector;
