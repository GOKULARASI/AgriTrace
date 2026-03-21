-- Supabase RLS Fix for AgriTrace
-- Since the AgriTrace backend handles all authentication and acts as a privileged intermediary,
-- we either need to use the Service Role Key or configure policies to allow the Node.js backend 
-- (currently using the Anon key) to read and write to the tables.

-- Option A: Disable RLS on the tables (Easiest if only your custom backend interacts with the DB)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;

-- Option B: Keep RLS enabled but allow all operations (if using Anon key)
-- Run these if you prefer to keep RLS enabled but need it to be permissive for the backend:
-- CREATE POLICY "Allow backend full access" ON users FOR ALL USING (true) WITH CHECK (true);
-- CREATE POLICY "Allow backend full access" ON products FOR ALL USING (true) WITH CHECK (true);
-- CREATE POLICY "Allow backend full access" ON transactions FOR ALL USING (true) WITH CHECK (true);
