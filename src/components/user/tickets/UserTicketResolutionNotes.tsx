import { CheckCircle, Clock, User } from 'lucide-react';
import type { Json } from '@/integrations/supabase/types';

interface ResolutionNote {
  note: string;
  admin_name: string;
  admin_id: string;
  timestamp: string;
}

interface UserTicketResolutionNotesProps {
  resolutionNotes: Json;
}

const UserTicketResolutionNotes = ({ resolutionNotes }: UserTicketResolutionNotesProps) => {
  // Parse resolution notes safely
  let notes: ResolutionNote[] = [];
  
  try {
    if (resolutionNotes && Array.isArray(resolutionNotes)) {
      notes = resolutionNotes.map((note: any) => ({
        note: note?.note || '',
        admin_name: note?.admin_name || '',
        admin_id: note?.admin_id || '',
        timestamp: note?.timestamp || ''
      })).filter(note => note.note && note.admin_name);
    }
  } catch (error) {
    console.error('Error parsing resolution notes:', error);
  }

  if (notes.length === 0) {
    return null;
  }

  return (
    <div className="border-t pt-4 mt-4">
      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <CheckCircle className="w-4 h-4 text-green-600" />
        Resolution Notes
      </h4>
      
      <div className="space-y-3">
        {notes.map((note, index) => (
          <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2 text-sm text-green-700">
                <User className="w-4 h-4" />
                <span className="font-medium">Resolved by {note.admin_name}</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-green-600">
                <Clock className="w-3 h-3" />
                <span>{new Date(note.timestamp).toLocaleString()}</span>
              </div>
            </div>
            
            <div className="bg-white rounded-md p-3 border border-green-100">
              <p className="text-sm text-gray-700 leading-relaxed">
                {note.note}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserTicketResolutionNotes;