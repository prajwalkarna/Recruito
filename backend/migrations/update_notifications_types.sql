-- ============================================
-- MIGRATION: Update Notifications Type Constraint
-- ============================================

-- Drop the old constraint
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;

-- Add the link column if it doesn't exist
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS link VARCHAR(500);

-- Add updated constraint with all notification types
ALTER TABLE notifications ADD CONSTRAINT notifications_type_check 
CHECK (type IN (
    'job_alert', 
    'application_status', 
    'application_received',
    'status_change',
    'new_message', 
    'job_expiring', 
    'profile_view',
    'job_saved'
));

-- Verify the changes
SELECT 
    constraint_name, 
    constraint_type 
FROM information_schema.table_constraints 
WHERE table_name = 'notifications';