ALTER TABLE class_session
ALTER COLUMN dayofweek TYPE INTEGER USING dayofweek::integer,
ALTER COLUMN dayofweek SET DEFAULT 1;
