
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface DepartmentAvatarProps {
  departmentCode: string;
  departmentName: string;
  imageUrl?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showOriginalFormat?: boolean;
  onClick?: () => void;
  clickable?: boolean;
}

const DepartmentAvatar = ({ 
  departmentCode, 
  departmentName, 
  imageUrl, 
  size = 'md',
  className = '',
  showOriginalFormat = false,
  onClick,
  clickable = false
}: DepartmentAvatarProps) => {
  const sizeClasses = {
    sm: showOriginalFormat ? 'w-14 h-10' : 'w-8 h-8',
    md: showOriginalFormat ? 'w-18 h-14' : 'w-10 h-10',
    lg: showOriginalFormat ? 'w-24 h-18' : 'w-12 h-12'
  };

  const fallbackTextSize = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  // Enhanced cache busting with multiple strategies for cross-admin visibility
  const processedImageUrl = imageUrl ? 
    `${imageUrl}&t=${Date.now()}&dept=${departmentCode}&admin_view=${Math.random().toString(36).substr(2, 9)}` 
    : undefined;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (clickable && onClick) {
      console.log('Department logo clicked - executing navigation');
      onClick();
    } else {
      console.log('Department logo clicked but not clickable or no handler provided');
    }
  };

  // When showOriginalFormat is true and we have an image, display it in a clear rectangular format
  if (showOriginalFormat && imageUrl) {
    const containerClasses = `${sizeClasses[size]} ${className} border border-gray-200 rounded-md overflow-hidden bg-gray-50 shadow-sm transition-all duration-300 ${
      clickable ? 'hover:shadow-lg cursor-pointer hover:scale-105 hover:border-blue-300' : 'hover:shadow-md'
    }`;
    
    return (
      <div 
        className={containerClasses}
        onClick={handleClick}
        role={clickable ? 'button' : 'img'}
        tabIndex={clickable ? 0 : -1}
        title={clickable ? `Click to return to main dashboard` : `${departmentName} Department Logo`}
      >
        <img 
          src={processedImageUrl} 
          alt={`${departmentName} Department Logo`}
          className="w-full h-full object-cover transition-opacity duration-300"
          onError={(e) => {
            console.error(`Failed to load department image for ${departmentCode}:`, imageUrl);
            // Enhanced fallback with better styling
            const parent = e.currentTarget.parentElement;
            if (parent) {
              parent.innerHTML = `
                <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 font-bold ${fallbackTextSize[size]} transition-all duration-300">
                  ${departmentCode.substring(0, 3)}
                </div>
              `;
            }
          }}
          onLoad={() => {
            console.log(`✓ Successfully loaded ${departmentCode} department image for admin view`);
          }}
        />
      </div>
    );
  }

  // Fallback to circular avatar with enhanced styling for admin dashboards
  const avatarClasses = `${sizeClasses[size]} ${className} shadow-sm transition-all duration-300 border-2 border-white ${
    clickable ? 'hover:shadow-lg cursor-pointer hover:scale-105 hover:border-blue-300' : 'hover:shadow-md'
  }`;
  
  return (
    <div
      onClick={handleClick}
      role={clickable ? 'button' : 'img'}
      tabIndex={clickable ? 0 : -1}
      title={clickable ? `Click to return to main dashboard` : `${departmentName} Department Avatar`}
    >
      <Avatar className={avatarClasses}>
        <AvatarImage 
          src={processedImageUrl} 
          alt={`${departmentName} Department Avatar`}
          className="transition-opacity duration-300"
          onLoad={() => {
            console.log(`✓ Successfully loaded ${departmentCode} avatar for admin dashboard`);
          }}
          onError={() => {
            console.log(`Using fallback avatar for ${departmentCode} department`);
          }}
        />
        <AvatarFallback className={`bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 font-bold ${fallbackTextSize[size]} border border-blue-300 transition-all duration-300 hover:from-blue-200 hover:to-blue-300`}>
          {departmentCode.substring(0, 2)}
        </AvatarFallback>
      </Avatar>
    </div>
  );
};

export default DepartmentAvatar;
