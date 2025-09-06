-- Create consolidated ticket stats function for optimized performance
CREATE OR REPLACE FUNCTION get_consolidated_ticket_stats()
RETURNS TABLE (
  total_count bigint,
  open_count bigint,
  in_progress_count bigint,
  resolved_count bigint,
  closed_count bigint,
  reopened_count bigint
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_count,
    COUNT(CASE WHEN status = 'Open' THEN 1 END) as open_count,
    COUNT(CASE WHEN status = 'In Progress' THEN 1 END) as in_progress_count,
    COUNT(CASE WHEN status = 'Resolved' THEN 1 END) as resolved_count,
    COUNT(CASE WHEN status = 'Closed' THEN 1 END) as closed_count,
    COUNT(CASE WHEN reopen_count > 0 AND assigned_admin_id IS NOT NULL AND status NOT IN ('Resolved', 'Closed') THEN 1 END) as reopened_count
  FROM tickets;
END;
$$;

-- Create indexes for frequently queried columns to improve performance
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON tickets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tickets_department_code ON tickets(department_code);
CREATE INDEX IF NOT EXISTS idx_tickets_assigned_admin_id ON tickets(assigned_admin_id);
CREATE INDEX IF NOT EXISTS idx_tickets_reopen_count ON tickets(reopen_count) WHERE reopen_count > 0;

-- Composite index for reopened tickets query optimization
CREATE INDEX IF NOT EXISTS idx_tickets_reopened_filter ON tickets(reopen_count, assigned_admin_id, status) 
WHERE reopen_count > 0 AND assigned_admin_id IS NOT NULL;