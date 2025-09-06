import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Users, Monitor, Image, Crown, Settings, X } from 'lucide-react';

interface FloatingTeamManagementProps {
  onOpenDigitalizationTeam: () => void;
  onOpenITTeam: () => void;
  onOpenBranding: () => void;
  onOpenLogo: () => void;
}

const FloatingTeamManagement = ({
  onOpenDigitalizationTeam,
  onOpenITTeam,
  onOpenBranding,
  onOpenLogo
}: FloatingTeamManagementProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => setIsExpanded(!isExpanded);

  const teamButtons = [
    {
      onClick: onOpenDigitalizationTeam,
      icon: Users,
      label: 'Digital Team',
      className: 'bg-primary hover:bg-primary/90 text-primary-foreground',
      delay: 'animation-delay-100'
    },
    {
      onClick: onOpenITTeam,
      icon: Monitor,
      label: 'IT Team',
      className: 'bg-green-600 hover:bg-green-700 text-white',
      delay: 'animation-delay-200'
    },
    {
      onClick: onOpenBranding,
      icon: Image,
      label: 'Branding',
      className: 'bg-purple-600 hover:bg-purple-700 text-white',
      delay: 'animation-delay-300'
    },
    {
      onClick: onOpenLogo,
      icon: Crown,
      label: 'Logo',
      className: 'bg-orange-600 hover:bg-orange-700 text-white',
      delay: 'animation-delay-400'
    }
  ];

  return (
    <div className="fixed bottom-6 left-6 z-50">
      {/* Main Settings Button */}
      <Button
        onClick={toggleExpanded}
        className={`
          bg-slate-700 hover:bg-slate-800 text-white 
          shadow-lg hover:shadow-xl transition-all duration-300 
          rounded-full w-14 h-14 p-0 mb-3
          ${isExpanded ? 'rotate-180' : ''}
        `}
        size="lg"
      >
        {isExpanded ? (
          <X className="h-6 w-6" />
        ) : (
          <Settings className="h-6 w-6" />
        )}
      </Button>

      {/* Team Management Buttons */}
      <div className={`
        flex flex-col gap-3 transform transition-all duration-500 ease-out
        ${isExpanded 
          ? 'translate-x-0 opacity-100 scale-100' 
          : '-translate-x-full opacity-0 scale-95 pointer-events-none'
        }
      `}>
        {teamButtons.map((button, index) => {
          const IconComponent = button.icon;
          return (
            <Button
              key={button.label}
              onClick={() => {
                button.onClick();
                setIsExpanded(false); // Close menu after selection
              }}
              className={`
                ${button.className}
                shadow-lg hover:shadow-xl transition-all duration-200 
                rounded-full p-3 min-w-max
                animate-slide-in-right
              `}
              style={{ animationDelay: `${index * 100}ms` }}
              size="lg"
            >
              <IconComponent className="h-6 w-6 mr-2" />
              {button.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default FloatingTeamManagement;