
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useTicketForm } from './ticket-form/useTicketForm';
import ClassificationSelector from './ticket-form/ClassificationSelector';
import CategoryTypeSelector from './ticket-form/CategoryTypeSelector';
import ModuleSelector from './ticket-form/ModuleSelector';
import DescriptionEditor from './ticket-form/DescriptionEditor';
import AttachmentUpload from './ticket-form/AttachmentUpload';
import FormActions from './ticket-form/FormActions';
import { useConfigurationData } from '@/hooks/useConfigurationData';

interface CreateTicketDialogProps {
  classificationCooldowns: Map<string, boolean>;
  canCreateTicketForClassification: (classification: string) => boolean;
  onTicketCreated: (classification: string) => void;
  triggerButton?: React.ReactNode;
}

const CreateTicketDialog = ({ classificationCooldowns, canCreateTicketForClassification, onTicketCreated, triggerButton }: CreateTicketDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { getClassificationByName, getCategoriesForClassification } = useConfigurationData();
  
  const {
    formData,
    attachments,
    isSubmitting,
    getAvailableCategories,
    handleClassificationChange,
    handleFieldChange,
    setAttachments,
    submitTicket,
    resetForm
  } = useTicketForm(onTicketCreated);

  const handleSubmit = async () => {
    console.log('Form submit requested with data:', formData);
    await submitTicket();
    setIsOpen(false);
    resetForm();
  };

  const handleCancel = () => {
    resetForm();
    setIsOpen(false);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      resetForm();
    }
  };

  const availableCategories = getAvailableCategories();
  
  // Determine if we should show category type selector
  const classification = getClassificationByName(formData.classification);
  const categories = classification ? getCategoriesForClassification(classification.id) : [];
  const showCategoryType = Boolean(formData.classification && 
                           categories.length > 0 && 
                           !(categories.length === 1 && categories[0].name === 'Default'));
  
  const selectedClassificationOnCooldown = formData.classification && !canCreateTicketForClassification(formData.classification);
  
  // Updated validation - classification and description are required, category type only if applicable
  const canSubmit = Boolean(
    formData.classification && 
    formData.description.trim() && 
    !selectedClassificationOnCooldown &&
    !isSubmitting &&
    // Only require category type if it should be shown and there are actual options
    (!showCategoryType || formData.categoryType)
  );

  console.log('Form validation state:', {
    classification: formData.classification,
    description: formData.description.trim(),
    categoryType: formData.categoryType,
    showCategoryType,
    availableCategories,
    canSubmit,
    selectedClassificationOnCooldown
  });

  const getCooldownMessage = () => {
    if (!formData.classification) {
      return "Please select a classification and provide a description to continue.";
    }
    
    if (!formData.description.trim()) {
      return "Please provide a description for your ticket.";
    }

    if (showCategoryType && !formData.categoryType) {
      return "Please select a category type for this classification.";
    }
    
    if (selectedClassificationOnCooldown) {
      return `Please wait 1 minute before submitting another "${formData.classification}" ticket. You can select a different classification to submit immediately.`;
    }
    
    return `Ready to submit your ticket. ${attachments && attachments.length > 0 ? `${attachments.length} file(s) will be attached.` : 'No files attached (optional).'}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button className="w-full md:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Create New Ticket
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Support Ticket</DialogTitle>
          <p className="text-sm text-muted-foreground mt-2">
            {getCooldownMessage()}
          </p>
        </DialogHeader>
        
        <div className="space-y-6 mt-4">
          <ClassificationSelector
            value={formData.classification}
            onChange={handleClassificationChange}
          />

          {formData.classification && selectedClassificationOnCooldown && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                ⏱️ You recently submitted a "{formData.classification}" ticket. Please wait 1 minute before submitting another ticket of this type, or select a different classification to proceed immediately.
              </p>
            </div>
          )}

          <CategoryTypeSelector
            value={formData.categoryType}
            onChange={(value) => handleFieldChange('categoryType', value)}
            selectedClassificationName={formData.classification}
            show={showCategoryType}
          />

          <ModuleSelector
            value={formData.acumaticaModule}
            onChange={(value) => handleFieldChange('acumaticaModule', value)}
          />
          
          <DescriptionEditor
            value={formData.description}
            onChange={(value) => handleFieldChange('description', value)}
          />

          <div className="border-t pt-4">
            <h4 className="text-sm font-medium mb-2 text-gray-700">
              File Attachments (Optional)
            </h4>
            <p className="text-xs text-gray-500 mb-3">
              You can attach files to help explain your issue, but this is completely optional.
            </p>
            <AttachmentUpload onFilesChange={setAttachments} />
          </div>
          
          <FormActions
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            canSubmit={canSubmit}
            isSubmitting={isSubmitting}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTicketDialog;
