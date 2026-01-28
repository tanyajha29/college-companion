-- Create Pending Verifications Table for Registration OTP Flow
CREATE TABLE IF NOT EXISTS pending_verifications (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    otp_hash VARCHAR(255) NOT NULL,
    user_data_json JSONB NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    attempts INT DEFAULT 0
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_pending_verifications_email ON pending_verifications(email);

-- Create index on expires_at for cleanup queries
CREATE INDEX IF NOT EXISTS idx_pending_verifications_expires_at ON pending_verifications(expires_at);
