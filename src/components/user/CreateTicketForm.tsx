
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, AlertTriangle, Ban } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import CreateTicketDialog from './CreateTicketDialog';
import { useIsMobile } from '@/hooks/use-mobile';

interface CreateTicketFormProps {
  classificationCooldowns: Map<string, boolean>;
  canCreateTicketForClassification: (classification: string) => boolean;
  onTicketCreated: (classification: string) => void;
}

const CreateTicketForm = ({
  classificationCooldowns,
  canCreateTicketForClassification,
  onTicketCreated
}: CreateTicketFormProps) => {
  const { profile } = useAuth();
  const isMobile = useIsMobile();

  // If user is suspended, show suspension notice instead of form
  if (profile?.is_suspended) {
    return (
      <Card className="mb-8 border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-800 flex items-center gap-2">
            <Ban className="w-5 h-5" />
            Account Suspended
          </CardTitle>
          <CardDescription className="text-red-700">
            You cannot create tickets while your account is suspended
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-3 p-4 bg-white rounded-lg border border-red-200">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-red-800 font-medium mb-1">
                Your account has been suspended by an administrator.
              </p>
              {profile.suspension_reason && (
                <p className="text-sm text-red-700 mb-2">
                  <strong>Reason:</strong> {profile.suspension_reason}
                </p>
              )}
              <p className="text-sm text-red-600">
                Please contact your department administrator to resolve this issue.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isMobile) {
    return (
      <div className="mb-6">
        <CreateTicketDialog
          classificationCooldowns={classificationCooldowns}
          canCreateTicketForClassification={canCreateTicketForClassification}
          onTicketCreated={onTicketCreated}
          triggerButton={
            <Button className="w-full h-14 text-lg font-semibold bg-primary hover:bg-primary/90">
              <Plus className="w-5 h-5 mr-2" />
              Create New Ticket
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Create New Ticket
          </CardTitle>
          <CardDescription>
            Submit a new support request for your department
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CreateTicketDialog
            classificationCooldowns={classificationCooldowns}
            canCreateTicketForClassification={canCreateTicketForClassification}
            onTicketCreated={onTicketCreated}
          />
        </CardContent>
      </Card>
    </>
  );
};

export default CreateTicketForm;
