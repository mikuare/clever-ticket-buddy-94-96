
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Module } from '@/hooks/useConfigurationData';

interface ModuleSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  modules: Module[];
}

export const ModuleSelect = ({ 
  value, 
  onValueChange, 
  modules 
}: ModuleSelectProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="module">Acumatica Module</Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select module" />
        </SelectTrigger>
        <SelectContent className="bg-white border shadow-lg max-h-60 overflow-y-auto z-50">
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
