
import { getAttachmentsArray } from '@/utils/attachmentUtils';
import type { Json } from '@/integrations/supabase/types';

interface TicketAttachmentsProps {
  attachments: Json;
}

const TicketAttachments = ({ attachments }: TicketAttachmentsProps) => {
  const attachmentFiles = getAttachmentsArray(attachments);

  if (!attachmentFiles || attachmentFiles.length === 0) {
    return null;
  }

  return (
    <div className="mt-2">
      <p className="text-xs text-gray-500">
        {attachmentFiles.length} attachment(s)
      </p>
      <div className="flex flex-wrap gap-2 mt-1">
        {attachmentFiles.map((attachment, idx) => (
          <a
            key={idx}
            href={attachment.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:underline"
          >
            {attachment.name}
          </a>
        ))}
      </div>
    </div>
  );
};

export default TicketAttachments;
