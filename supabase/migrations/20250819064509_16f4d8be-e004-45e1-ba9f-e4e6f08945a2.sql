-- Update get_escalated_tickets to include resolution notes
CREATE OR REPLACE FUNCTION public.get_escalated_tickets()
RETURNS TABLE(
  escalation_id uuid, 
  ticket_id uuid, 
  ticket_number text, 
  ticket_title text, 
  ticket_description text, 
  ticket_priority text, 
  ticket_department_code text, 
  ticket_created_at timestamp with time zone, 
  escalated_by_admin_id uuid, 
  escalated_by_admin_name text, 
  escalation_reason text, 
  escalated_at timestamp with time zone, 
  user_full_name text, 
  user_email text,
  resolution_notes jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ie.id as escalation_id,
    t.id as ticket_id,
    t.ticket_number,
    t.title as ticket_title,
    t.description as ticket_description,
    t.priority as ticket_priority,
    t.department_code as ticket_department_code,
    t.created_at as ticket_created_at,
    ie.escalated_by_admin_id,
    p_admin.full_name as escalated_by_admin_name,
    ie.escalation_reason,
    ie.escalated_at,
    p_user.full_name as user_full_name,
    p_user.email as user_email,
    t.resolution_notes
  FROM infosoft_escalations ie
  JOIN tickets t ON ie.ticket_id = t.id
  JOIN profiles p_admin ON ie.escalated_by_admin_id = p_admin.id
  JOIN profiles p_user ON t.user_id = p_user.id
  WHERE ie.status = 'escalated'
  ORDER BY ie.escalated_at DESC;
END;
$$;