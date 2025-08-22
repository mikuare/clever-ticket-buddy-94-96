
import type { TicketActivity } from '../types';
import { getDepartmentName } from '../utils';

interface StatusChangedDescriptionProps {
  activity: TicketActivity;
}

export const StatusChangedDescription = ({ activity }: StatusChangedDescriptionProps) => {
  // Handle automatic status changes from database triggers
  if (activity.description) {
    // Clean description and avoid duplicating information already in other activity types
    let cleanDescription = activity.description;
    
    // Skip status_changed entries that duplicate other specific activity types
    if (cleanDescription.includes('Ticket assigned to') && 
        cleanDescription !== activity.description) {
      // This should be handled by 'assigned' activity type instead
      return null;
    }
    
    if (cleanDescription.includes('Ticket marked as resolved') || 
        cleanDescription.includes('Ticket resolved by')) {
      // This should be handled by 'resolved' activity type instead
      return null;
    }
    
    // Skip if admin name or department is unknown/empty for admin actions
    if (activity.admin_name && activity.department_code) {
      if (activity.admin_name === 'Unknown Admin' || activity.department_code === 'Unknown') {
        return null;
      }
      
      const adminName = activity.admin_name;
      const deptName = getDepartmentName(activity.department_code);
      
      if (cleanDescription.includes('Status changed to')) {
        const statusMatch = cleanDescription.match(/Status changed to (\w+)/);
        const newStatus = statusMatch ? statusMatch[1] : 'Unknown';
        return `Status updated to "${newStatus}" by ${adminName} from ${deptName}`;
      }
    }
    
    // Clean up description to remove priority mentions
    cleanDescription = cleanDescription.replace(/with priority: \w+/gi, '');
    cleanDescription = cleanDescription.replace(/priority: \w+/gi, '');
    cleanDescription = cleanDescription.replace(/\s+/g, ' ').trim();
    
    return cleanDescription;
  }
  
  return 'Status updated';
};
