-- Update the resolve_infosoft_escalation function to include resolution notes
CREATE OR REPLACE FUNCTION public.resolve_infosoft_escalation_with_notes(
  p_escalation_id uuid, 
  p_admin_id uuid, 
  p_resolution_note text
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  escalation_record record;
  admin_profile RECORD;
BEGIN
  -- Get escalation details and verify admin can resolve it
  SELECT * INTO escalation_record
  FROM infosoft_escalations 
  WHERE id = p_escalation_id 
  AND escalated_by_admin_id = p_admin_id 
  AND status = 'escalated';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Escalation not found or you do not have permission to resolve it';
  END IF;

  -- Get admin profile details
  SELECT full_name, department_code INTO admin_profile
  FROM public.profiles 
  WHERE id = p_admin_id;

  -- Get current resolution notes and add the new one
  DECLARE
    current_ticket RECORD;
    current_notes jsonb;
    new_note jsonb;
    updated_notes jsonb;
  BEGIN
    SELECT resolution_notes INTO current_ticket
    FROM tickets 
    WHERE id = escalation_record.ticket_id;

    -- Handle existing resolution notes
    IF current_ticket.resolution_notes IS NULL THEN
      current_notes := '[]'::jsonb;
    ELSE
      current_notes := current_ticket.resolution_notes;
    END IF;

    -- Create new resolution note
    new_note := jsonb_build_object(
      'note', p_resolution_note,
      'admin_name', COALESCE(admin_profile.full_name, 'Unknown Admin'),
      'admin_id', p_admin_id,
      'timestamp', NOW()::timestamp with time zone
    );

    -- Add new note to existing notes
    updated_notes := current_notes || new_note;

    -- Update escalation status
    UPDATE infosoft_escalations 
    SET 
      status = 'resolved',
      resolved_at = NOW(),
      updated_at = NOW()
    WHERE id = p_escalation_id;

    -- Update ticket status to resolved with resolution notes
    UPDATE tickets 
    SET 
      status = 'Resolved',
      admin_resolved_at = NOW(),
      updated_at = NOW(),
      resolution_notes = updated_notes
    WHERE id = escalation_record.ticket_id;

    RETURN TRUE;
  END;
END;
$$;