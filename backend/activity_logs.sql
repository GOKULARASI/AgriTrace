-- Run this in your Supabase SQL Editor to create the activity logs table

CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id TEXT NOT NULL,
    action TEXT NOT NULL,
    performed_by TEXT,
    role TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, NOW())
);

-- Index for faster lookups by product_id or timestamp
CREATE INDEX IF NOT EXISTS idx_activity_logs_product_id ON activity_logs(product_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_timestamp ON activity_logs(timestamp);
