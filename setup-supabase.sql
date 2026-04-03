
-- Create users table with proper structure
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  cpf TEXT,
  parent_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active BIGINT,
  profile_data JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow public to read users" ON users;
DROP POLICY IF EXISTS "Allow public to create users" ON users;
DROP POLICY IF EXISTS "Allow public to update users" ON users;
DROP POLICY IF EXISTS "Allow public to delete users" ON users;

-- Create new policies
CREATE POLICY "Allow public to read users" ON users
  FOR SELECT
  USING (true);
CREATE POLICY "Allow public to create users" ON users
  FOR INSERT
  WITH CHECK (true);
CREATE POLICY "Allow public to update users" ON users
  FOR UPDATE
  USING (true)
  WITH CHECK (true);
CREATE POLICY "Allow public to delete users" ON users
  FOR DELETE
  USING (true);
