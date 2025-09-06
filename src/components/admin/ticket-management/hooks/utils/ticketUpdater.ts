
import { supabase } from '@/integrations/supabase/client';
import type { Ticket } from '@/types/admin';

interface UpdateTicketParams {
  ticket: Ticket;
  selectedClassification: string;
  selectedCategory: string;
  selectedModule: string;
}

export const updateTicketDetails = async ({
  ticket,
  selectedClassification,
  selectedCategory,
  selectedModule
}: UpdateTicketParams) => {
  console.log('Starting ticket details update process...');
  
  // Update the ticket's attachments field with new metadata
  const currentAttachments = ticket.attachments;
  let updatedAttachments: Record<string, any>;

  // Safely handle the attachments spread operation
  if (currentAttachments && typeof currentAttachments === 'object' && !Array.isArray(currentAttachments)) {
    updatedAttachments = {
      ...(currentAttachments as Record<string, any>),
      classification: selectedClassification,
      categoryType: selectedCategory,
      acumaticaModule: selectedModule
    };
  } else {
    updatedAttachments = {
      classification: selectedClassification,
      categoryType: selectedCategory,
      acumaticaModule: selectedModule
    };
  }

  console.log('Updating ticket with new attachments:', updatedAttachments);

  const { error: updateError } = await supabase
    .from('tickets')
    .update({
      attachments: updatedAttachments,
      updated_at: new Date().toISOString()
    })
    .eq('id', ticket.id);

  if (updateError) {
    console.error('Error updating ticket:', updateError);
    throw updateError;
  }

  console.log('Ticket updated successfully');
};
