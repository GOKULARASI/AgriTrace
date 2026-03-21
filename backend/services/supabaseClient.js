const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    const missing = [];
    if (!supabaseUrl) missing.push('SUPABASE_URL');
    if (!supabaseKey) missing.push('SUPABASE_KEY');
    console.error(`Missing required Supabase env vars: ${missing.join(', ')}`);
    throw new Error(`Missing required Supabase env vars: ${missing.join(', ')}`);
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
