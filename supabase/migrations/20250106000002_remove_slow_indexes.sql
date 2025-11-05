-- Remove indexes that might be slowing down queries
-- These can sometimes make queries slower if not used correctly

DROP INDEX IF EXISTS idx_tickets_created_at_desc;
DROP INDEX IF EXISTS idx_tickets_status;
DROP INDEX IF EXISTS idx_tickets_user_id;
DROP INDEX IF EXISTS idx_tickets_reopen;
DROP INDEX IF EXISTS idx_tickets_assigned_admin_status;
DROP INDEX IF EXISTS idx_tickets_department_code;
DROP INDEX IF EXISTS idx_tickets_reopened_priority;

-- Clear any cached query plans
ANALYZE tickets;

