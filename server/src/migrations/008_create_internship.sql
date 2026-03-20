CREATE TABLE IF NOT EXISTS internship (
  internshipid SERIAL PRIMARY KEY,
  companyname TEXT NOT NULL,
  jobtitle TEXT NOT NULL,
  description TEXT,
  stipend NUMERIC,
  applicationdeadline DATE NOT NULL,
  status TEXT DEFAULT 'Applied',
  nextinterviewdate DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
