-- ============================================
-- ADD THEME COLUMNS TO USER SETTINGS
-- ============================================

ALTER TABLE user_settings 
ADD COLUMN IF NOT EXISTS theme VARCHAR(10) DEFAULT 'light',
ADD COLUMN IF NOT EXISTS accent_color VARCHAR(7) DEFAULT '#667eea';
