
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useConfigurationData } from '@/hooks/useConfigurationData';
import { useEditTicketDetails } from './hooks/useEditTicketDetails';
import { ClassificationSelect } from './components/ClassificationSelect';
import { CategorySelect } from './components/CategorySelect';
import { ModuleSelect } from './components/ModuleSelect';
import { DialogActions } from './components/DialogActions';
import type { Ticket } from '@/types/admin';

interface EditTicketDetailsDialogProps {
  ticket: Ticket;
  isOpen: boolean;
  onClose: () => void;
  onTicketUpdated: () => void;
}

const EditTicketDetailsDialog = ({ 
  ticket, 
  isOpen, 
  onClose, 
  onTicketUpdated 
}: EditTicketDetailsDialogProps) => {
  const { classifications, categories, modules, getCategoriesForClassification } = useConfigurationData();
  
  const {
    selectedClassification,
    selectedCategory,
    selectedModule,
    setSelectedCategory,
    setSelectedModule,
    handleClassificationChange,
    handleSave,
    handleCancel,
    isLoading
  } = useEditTicketDetails(ticket, onTicketUpdated, onClose);

  const availableCategories = selectedClassification 
    ? getCategoriesForClassification(classifications.find(c => c.name === selectedClassification)?.id || '')
    : [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Ticket Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <ClassificationSelect
            value={selectedClassification}
            onValueChange={handleClassificationChange}
            classifications={classifications}
          />

          <CategorySelect
            value={selectedCategory}
            onValueChange={setSelectedCategory}
            categories={availableCategories}
            disabled={!selectedClassification}
          />

          <ModuleSelect
            value={selectedModule}
            onValueChange={setSelectedModule}
            modules={modules}
          />
        </div>

        <DialogActions
          onCancel={handleCancel}
          onSave={handleSave}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
};

export default EditTicketDetailsDialog;
