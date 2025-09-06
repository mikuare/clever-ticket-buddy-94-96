
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  full_name: string;
  email: string;
  department_code: string;
  is_admin: boolean;
  avatar_url?: string;
  mobile_number?: string;
  social_media_links?: any;
  show_on_main_page?: boolean;
}

interface LogActivityParams {
  ticketId: string;
  profile: Profile;
  originalDetails: {
    classification: string;
    categoryType: string;
    acumaticaModule: string;
  };
  newDetails: {
    classification: string;
    categoryType: string;
    acumaticaModule: string;
  };
}

export const logTicketDetailChanges = async ({
  ticketId,
  profile,
  originalDetails,
  newDetails
}: LogActivityParams) => {
  const changes = [];
  
  if (originalDetails.classification !== newDetails.classification) {
    changes.push(`Classification: "${originalDetails.classification || 'Not Set'}" → "${newDetails.classification}"`);
  }
  
  if (originalDetails.categoryType !== newDetails.categoryType) {
    changes.push(`Category: "${originalDetails.categoryType || 'Not Set'}" → "${newDetails.categoryType}"`);
  }
  
  if (originalDetails.acumaticaModule !== newDetails.acumaticaModule) {
    changes.push(`Module: "${originalDetails.acumaticaModule || 'Not Set'}" → "${newDetails.acumaticaModule}"`);
  }

  if (changes.length > 0) {
    // Fetch the latest profile data to ensure accurate department information
    const { data: latestProfile } = await supabase
      .from('profiles')
      .select('full_name, department_code')
      .eq('id', profile.id)
      .single();

    const adminName = latestProfile?.full_name || profile.full_name;
    const departmentCode = latestProfile?.department_code || profile.department_code;
    
    const description = `Admin ${adminName} edited ticket details: ${changes.join('; ')}`;
    
    console.log('Logging ticket activity with details:', {
      ticket_id: ticketId,
      user_id: profile.id,
      activity_type: 'details_updated',
      description,
      admin_name: adminName,
      department_code: departmentCode,
      changes: changes
    });

    try {
      const { data, error } = await supabase
        .from('ticket_activities')
        .insert({
          ticket_id: ticketId,
          user_id: profile.id,
          activity_type: 'details_updated',
          description,
          admin_name: adminName,
          department_code: departmentCode,
          old_value: JSON.stringify(originalDetails),
          new_value: JSON.stringify(newDetails)
        })
        .select();

      if (error) {
        console.error('Error logging ticket activity:', error);
        console.error('Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }

      if (data && data.length > 0) {
        console.log('Successfully logged ticket activity:', data[0]);
      } else {
        console.log('Activity logged but no data returned');
      }
    } catch (error) {
      console.error('Failed to log ticket activity:', error);
      throw error;
    }
  } else {
    console.log('No changes detected, skipping activity log');
  }
};
