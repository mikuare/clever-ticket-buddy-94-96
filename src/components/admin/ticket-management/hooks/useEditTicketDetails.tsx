
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import type { Ticket } from '@/types/admin';
import { extractTicketDetails } from './utils/ticketDetailsExtractor';
import { logTicketDetailChanges } from './utils/ticketActivityLogger';
import { updateTicketDetails } from './utils/ticketUpdater';

export const useEditTicketDetails = (
  ticket: Ticket,
  onTicketUpdated: () => void,
  onClose: () => void
) => {
  const { toast } = useToast();
  const { profile } = useAdminAuth();
  const [isLoading, setIsLoading] = useState(false);

  const originalDetails = extractTicketDetails(ticket);
  const [selectedClassification, setSelectedClassification] = useState(originalDetails.classification);
  const [selectedCategory, setSelectedCategory] = useState(originalDetails.categoryType);
  const [selectedModule, setSelectedModule] = useState(originalDetails.acumaticaModule);

  const handleSave = async () => {
    if (!profile) {
      toast({
        title: "Error",
        description: "Unable to verify admin profile",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Update the ticket details
      await updateTicketDetails({
        ticket,
        selectedClassification,
        selectedCategory,
        selectedModule
      });

      console.log('Ticket updated successfully, now logging activity...');

      // Log the changes to ticket progression with before/after values
      await logTicketDetailChanges({
        ticketId: ticket.id,
        profile,
        originalDetails,
        newDetails: {
          classification: selectedClassification,
          categoryType: selectedCategory,
          acumaticaModule: selectedModule
        }
      });

      toast({
        title: "Success",
        description: "Ticket details updated successfully and changes logged",
      });

      onTicketUpdated();
      onClose();
    } catch (error) {
      console.error('Error updating ticket details:', error);
      
      let errorMessage = "Failed to update ticket details";
      if (error instanceof Error) {
        errorMessage += `: ${error.message}`;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset to original values
    setSelectedClassification(originalDetails.classification);
    setSelectedCategory(originalDetails.categoryType);
    setSelectedModule(originalDetails.acumaticaModule);
    onClose();
  };

  const handleClassificationChange = (value: string) => {
    setSelectedClassification(value);
    setSelectedCategory(''); // Reset category when classification changes
  };

  return {
    selectedClassification,
    selectedCategory,
    selectedModule,
    setSelectedCategory,
    setSelectedModule,
    handleClassificationChange,
    handleSave,
    handleCancel,
    isLoading
  };
};
