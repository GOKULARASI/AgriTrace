-- Run this in your Supabase SQL Editor to create the tracking table

CREATE TABLE IF NOT EXISTS product_tracking (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id TEXT UNIQUE NOT NULL,
    product_name TEXT NOT NULL,
    
    -- Farmer Details
    farmer_id TEXT,
    farmer_name TEXT,
    date_of_sowing DATE,
    date_of_harvesting DATE,
    
    -- Industry Details
    industry_id TEXT,
    industry_name TEXT,
    date_of_processing DATE,
    date_of_packing DATE,
    
    -- Transport Details
    transporter_id TEXT,
    transporter_name TEXT,
    date_of_shipping DATE,
    date_of_delivery DATE,
    
    status TEXT DEFAULT 'Sown',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, NOW())
);

-- Index for faster lookups by product_id
CREATE INDEX IF NOT EXISTS idx_product_tracking_product_id ON product_tracking(product_id);
