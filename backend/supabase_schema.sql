-- Supabase schema setup for AgriTrace
-- Copy and run this in your Supabase SQL Editor

-- Create users table
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL,
  location TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, NOW())
);

-- Create products table
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id TEXT UNIQUE NOT NULL,
  crop_name TEXT NOT NULL,
  quantity_text TEXT NOT NULL,
  farmer_location TEXT NOT NULL,
  current_status TEXT NOT NULL,
  batch_id TEXT,
  qr_code_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, NOW())
);

-- Create transactions table
CREATE TABLE transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id TEXT UNIQUE NOT NULL,
  farmer_id UUID REFERENCES users(id) ON DELETE SET NULL,
  industry_id UUID REFERENCES users(id) ON DELETE SET NULL,
  product_id TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  type TEXT,
  payment_method TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, NOW())
);
