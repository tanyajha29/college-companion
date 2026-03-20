ALTER TABLE class_session
ADD COLUMN IF NOT EXISTS dayofweek TEXT DEFAULT 'Monday';
