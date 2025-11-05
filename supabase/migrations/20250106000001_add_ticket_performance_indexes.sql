-- Add performance indexes for faster ticket loading
-- These indexes will dramatically speed up the admin dashboard

-- Index for ORDER BY created_at DESC (most important for initial load)
CREATE INDEX IF NOT EXISTS idx_tickets_created_at_desc ON tickets(created_at DESC);

-- Index for status filtering
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);

-- Index for user_id lookups (speeds up profile joins)
CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON tickets(user_id);

-- Composite index for reopened tickets
CREATE INDEX IF NOT EXISTS idx_tickets_reopen ON tickets(reopen_count, assigned_admin_id, status) 
WHERE reopen_count > 0;

-- Update table statistics for better query planning
ANALYZE tickets;

