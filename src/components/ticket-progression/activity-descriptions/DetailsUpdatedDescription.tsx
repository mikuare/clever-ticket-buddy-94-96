
import type { TicketActivity } from '../types';
import { getDepartmentName } from '../utils';

interface DetailsUpdatedDescriptionProps {
  activity: TicketActivity;
}

export const DetailsUpdatedDescription = ({ activity }: DetailsUpdatedDescriptionProps) => {
  // Skip if admin name or department is unknown/empty
  if (!activity.admin_name || activity.admin_name === 'Unknown Admin' || 
      !activity.department_code || activity.department_code === 'Unknown') {
    return null;
  }
  
  const adminName = activity.admin_name;
  const adminDept = getDepartmentName(activity.department_code);
  
  // Extract the detailed changes from description
  if (activity.description && activity.description.includes('edited ticket details:')) {
    const changesText = activity.description.split('edited ticket details: ')[1];
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
          <div className="font-medium text-gray-900">
            <span className="text-purple-600 font-semibold">{adminName}</span> 
            <span className="text-gray-600"> from </span>
            <span className="text-gray-700 font-medium">{adminDept}</span>
            <span className="text-gray-600"> edited ticket details</span>
          </div>
        </div>
        
        <div className="ml-4 bg-purple-50 border-l-4 border-purple-500 p-4 rounded-r-lg">
          <div className="space-y-2">
            <div className="text-sm font-medium text-purple-800 mb-2">Changes Made:</div>
            {changesText.split('; ').map((change, index) => (
              <div key={index} className="flex items-start gap-2">
                <span className="text-purple-600 font-bold text-xs mt-1">▶</span>
                <span className="text-gray-800 text-sm leading-relaxed">{change}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="ml-4 text-xs text-gray-500 flex items-center gap-1">
          <span>Modified on</span>
          <span className="font-medium text-gray-600">
            {new Date(activity.created_at).toLocaleString('en-US', {
              weekday: 'short',
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
        <div className="font-medium text-gray-900">
          <span className="text-purple-600 font-semibold">{adminName}</span>
          <span className="text-gray-600"> from </span>
          <span className="text-gray-700 font-medium">{adminDept}</span>
          <span className="text-gray-600"> updated ticket details</span>
        </div>
      </div>
      <div className="ml-4 text-xs text-gray-500">
        Modified on {new Date(activity.created_at).toLocaleString('en-US', {
          weekday: 'short',
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}
      </div>
    </div>
  );
};
