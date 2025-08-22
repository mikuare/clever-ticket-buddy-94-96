
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useConfigurationData } from '@/hooks/useConfigurationData';
import type { Json } from '@/integrations/supabase/types';

export interface TicketFormData {
  classification: string;
  categoryType: string;
  acumaticaModule: string;
  description: string;
}

export const useTicketForm = (onTicketCreated: (classification: string) => void) => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const { getClassificationByName, getCategoriesForClassification } = useConfigurationData();
  
  const [formData, setFormData] = useState<TicketFormData>({
    classification: '',
    categoryType: '',
    acumaticaModule: '',
    description: ''
  });
  
  const [attachments, setAttachments] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get available categories based on selected classification
  const getAvailableCategories = () => {
    if (!formData.classification) return [];
    
    const classification = getClassificationByName(formData.classification);
    if (!classification) return [];
    
    const categories = getCategoriesForClassification(classification.id);
    return categories.map(cat => cat.name);
  };

  // Handle classification change and reset category
  const handleClassificationChange = (value: string) => {
    console.log('Classification changed to:', value);
    setFormData(prev => ({ 
      ...prev, 
      classification: value, 
      categoryType: '' // Reset category when classification changes
    }));
  };

  const handleFieldChange = (field: keyof TicketFormData, value: string) => {
    console.log(`Field ${field} changed to:`, value);
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({
      classification: '',
      categoryType: '',
      acumaticaModule: '',
      description: ''
    });
    setAttachments([]);
  };

  const validateForm = () => {
    console.log('Validating form with data:', formData);
    
    // Only require classification and description - attachments are optional
    if (!formData.classification || !formData.description || !profile?.id) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields (Classification and Description)",
        variant: "destructive"
      });
      return false;
    }

    // Special handling for category type validation
    const availableCategories = getAvailableCategories();
    console.log('Available categories:', availableCategories);
    
    // Only require category type if there are multiple categories or categories other than "Default"
    const shouldRequireCategoryType = availableCategories.length > 0 && 
                                     !(availableCategories.length === 1 && availableCategories[0] === 'Default');
    
    console.log('Should require category type:', shouldRequireCategoryType);
    console.log('Current category type:', formData.categoryType);
    
    if (shouldRequireCategoryType && !formData.categoryType) {
      toast({
        title: "Missing Information",
        description: "Please select a category type",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const submitTicket = async () => {
    console.log('Attempting to submit ticket...');
    
    if (!validateForm()) {
      console.log('Form validation failed');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create a structured title from the selections
      const titleParts = [formData.classification];
      if (formData.categoryType && formData.categoryType !== 'Default') {
        titleParts.push(formData.categoryType);
      }
      if (formData.acumaticaModule) {
        titleParts.push(`(${formData.acumaticaModule})`);
      }
      const structuredTitle = titleParts.join(' - ');

      // Determine priority based on classification/category
      let priority = 'Medium'; // Default
      if (formData.classification === 'Customization') {
        // For Customization, use the category type as priority if it's a valid priority
        const validPriorities = ['Low', 'Medium', 'High', 'Critical'];
        if (formData.categoryType && validPriorities.includes(formData.categoryType)) {
          priority = formData.categoryType;
        } else {
          priority = 'Medium'; // Default for Customization
        }
      } else if (formData.classification === 'Login Access' || formData.classification === 'System Issues') {
        priority = 'High';
      } else if (formData.classification === 'Network & Connectivity') {
        priority = 'Critical';
      }

      // Prepare attachments data - ensure it's always a valid object structure
      const attachmentsData = {
        // Only include files array if there are actual attachments
        ...(attachments && attachments.length > 0 ? { files: attachments } : {}),
        // Always include metadata for proper ticket categorization
        classification: formData.classification,
        categoryType: formData.categoryType || '',
        acumaticaModule: formData.acumaticaModule || ''
      };

      console.log('Creating ticket with data:', {
        title: structuredTitle,
        description: formData.description,
        priority,
        attachments: attachmentsData,
        hasFiles: attachments && attachments.length > 0
      });

      const { data, error } = await supabase
        .from('tickets')
        .insert({
          title: structuredTitle,
          description: formData.description,
          priority: priority,
          user_id: profile!.id,
          department_code: profile!.department_code || 'GEN',
          attachments: attachmentsData as Json,
          ticket_number: '' // This will be auto-generated by the trigger
        })
        .select()
        .single();

      if (error) {
        console.error('Ticket creation error:', error);
        throw error;
      }

      console.log('Ticket created successfully:', data);

      // Update cooldown for this specific classification
      await supabase
        .from('user_cooldowns')
        .upsert({
          user_id: profile!.id,
          classification: formData.classification,
          last_ticket_time: new Date().toISOString()
        });

      // Log activity
      await supabase
        .from('ticket_activities')
        .insert({
          ticket_id: data.id,
          user_id: profile!.id,
          activity_type: 'created',
          description: `Ticket created: ${data.title}`
        });

      toast({
        title: "👋 Thank you for contacting Helpdesk!",
        description: `📨 Your support ticket ${data.ticket_number} has been successfully created. A member of our support team will review your request shortly and get back to you as soon as possible. 💬 You can now communicate directly with our support team through this ticket. ⏳ We appreciate your patience and are here to help! — Helpdesk Chatbot 🤖`,
        duration: 8000,
      });

      resetForm();
      onTicketCreated(formData.classification);

    } catch (error) {
      console.error('Error creating ticket:', error);
      toast({
        title: "Error Creating Ticket",
        description: error instanceof Error ? error.message : "Failed to create ticket. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    attachments,
    isSubmitting,
    getAvailableCategories,
    handleClassificationChange,
    handleFieldChange,
    setAttachments,
    submitTicket,
    resetForm
  };
};
