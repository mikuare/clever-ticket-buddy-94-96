
import { Button } from '@/components/ui/button';

interface FormActionsProps {
  onSubmit: () => void;
  onCancel: () => void;
  canSubmit: boolean;
  isSubmitting: boolean;
}

const FormActions = ({ onSubmit, onCancel, canSubmit, isSubmitting }: FormActionsProps) => {
  return (
    <div className="flex gap-2">
      <Button 
        onClick={onSubmit}
        disabled={!canSubmit || isSubmitting}
      >
        {isSubmitting ? 'Submitting...' : 'Submit Ticket'}
      </Button>
      <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
        Cancel
      </Button>
    </div>
  );
};

export default FormActions;
