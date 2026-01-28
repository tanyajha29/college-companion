-- Create OTP Store Table for 2-Step Authentication
CREATE TABLE IF NOT EXISTS otp_store (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    otp_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    attempts INT DEFAULT 0
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_otp_store_email ON otp_store(email);

-- Create index on expires_at for cleanup queries
CREATE INDEX IF NOT EXISTS idx_otp_store_expires_at ON otp_store(expires_at);
