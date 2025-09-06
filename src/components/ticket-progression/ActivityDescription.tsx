
import type { TicketActivity, TicketCreator } from './types';
import { CreatedDescription } from './activity-descriptions/CreatedDescription';
import { AssignedDescription } from './activity-descriptions/AssignedDescription';
import { ResolvedDescription } from './activity-descriptions/ResolvedDescription';
import { ClosedDescription } from './activity-descriptions/ClosedDescription';
import { ReferralDescription } from './activity-descriptions/ReferralDescription';
import { ReferralAcceptedDescription } from './activity-descriptions/ReferralAcceptedDescription';
import { ReferralDeclinedDescription } from './activity-descriptions/ReferralDeclinedDescription';
import { DetailsUpdatedDescription } from './activity-descriptions/DetailsUpdatedDescription';
import { StatusChangedDescription } from './activity-descriptions/StatusChangedDescription';
import { EscalatedToInfosoftDescription } from './activity-descriptions/EscalatedToInfosoftDescription';
import { EscalationResolvedDescription } from './activity-descriptions/EscalationResolvedDescription';
import { ReopenedDescription } from './activity-descriptions/ReopenedDescription';

interface ActivityDescriptionProps {
  activity: TicketActivity;
  ticketCreator: TicketCreator | null;
}

export const ActivityDescription = ({ activity, ticketCreator }: ActivityDescriptionProps) => {
  const getDescription = () => {
    switch (activity.activity_type) {
      case 'created':
        return <CreatedDescription activity={activity} ticketCreator={ticketCreator} />;
      
      case 'assigned':
        return <AssignedDescription activity={activity} />;
      
      case 'resolved':
        return <ResolvedDescription activity={activity} />;
      
      case 'closed':
        return <ClosedDescription activity={activity} ticketCreator={ticketCreator} />;
      
      case 'referred':
        return <ReferralDescription activity={activity} />;
      
      case 'referral_accepted':
        return <ReferralAcceptedDescription activity={activity} />;
      
      case 'referral_declined':
        return <ReferralDeclinedDescription activity={activity} />;
      
      case 'details_updated':
        return <DetailsUpdatedDescription activity={activity} />;
      
      case 'status_changed':
        return <StatusChangedDescription activity={activity} />;
      
      case 'escalated_to_infosoft':
        return <EscalatedToInfosoftDescription activity={activity} />;
      
      case 'escalation_resolved':
        return <EscalationResolvedDescription activity={activity} />;
      
      case 'reopened':
        return <ReopenedDescription activity={activity} />;
      
      default:
        // For other activities, clean up description to remove priority mentions
        let cleanDescription = activity.description;
        cleanDescription = cleanDescription.replace(/with priority: \w+/gi, '');
        cleanDescription = cleanDescription.replace(/priority: \w+/gi, '');
        cleanDescription = cleanDescription.replace(/\s+/g, ' ').trim();
        return cleanDescription;
    }
  };

  const description = getDescription();
  
  // Don't render if description is null (filtered out duplicates or unknown entries)
  if (!description) {
    return null;
  }

  return (
    <div className="text-sm text-gray-700 font-medium">
      {typeof description === 'string' ? description : description}
    </div>
  );
};
