CREATE TABLE IF NOT EXISTS settings (
  setting_key VARCHAR(100) PRIMARY KEY,
  setting_value VARCHAR(100) NOT NULL
);

INSERT INTO settings (setting_key, setting_value)
VALUES ('attendance_threshold', '75')
ON CONFLICT (setting_key) DO NOTHING;
