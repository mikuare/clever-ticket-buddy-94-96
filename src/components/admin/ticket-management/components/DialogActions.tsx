
import { Button } from '@/components/ui/button';

interface DialogActionsProps {
  onCancel: () => void;
  onSave: () => void;
  isLoading: boolean;
}

export const DialogActions = ({ onCancel, onSave, isLoading }: DialogActionsProps) => {
  return (
    <div className="flex justify-end gap-2">
      <Button variant="outline" onClick={onCancel} disabled={isLoading}>
        Cancel
      </Button>
      <Button onClick={onSave} disabled={isLoading}>
        {isLoading ? 'Saving...' : 'Save Changes'}
      </Button>
    </div>
  );
};
