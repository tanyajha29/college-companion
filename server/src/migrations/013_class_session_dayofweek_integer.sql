ALTER TABLE class_session
ALTER COLUMN dayofweek DROP DEFAULT;

ALTER TABLE class_session
ALTER COLUMN dayofweek TYPE INTEGER USING dayofweek::integer;

ALTER TABLE class_session
ALTER COLUMN dayofweek SET DEFAULT 1;
