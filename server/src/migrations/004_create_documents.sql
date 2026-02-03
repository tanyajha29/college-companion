CREATE TABLE IF NOT EXISTS documents (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES "USER"(userid) ON DELETE CASCADE,
  s3_key TEXT NOT NULL,
  file_name TEXT NOT NULL,
  mime_type TEXT,
  label TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  verified_by INTEGER REFERENCES "USER"(userid),
  verified_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
