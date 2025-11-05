-- Add performance indexes for server-side pagination
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tickets_created_at_desc ON tickets (created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tickets_status_created_at ON tickets (status, created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tickets_department_created_at ON tickets (department_code, created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tickets_assigned_admin_created_at ON tickets (assigned_admin_id, created_at DESC);

-- Composite index for efficient reopen tracking
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tickets_reopen_priority ON tickets (reopen_count, assigned_admin_id, status, created_at DESC) WHERE reopen_count > 0;