require('dotenv').config();
const supabase = require('./services/supabaseClient');

async function test() {
    console.log("Testing Supabase Insert...");
    const { data: user, error } = await supabase
        .from('users')
        .insert([{ name: 'test3', email: 'test3@test.com', password: 'test', role: 'Farmer', location: 'test', phone: 'test' }])
        .select()
        .single();
    if (error) {
        console.error("SUPABASE ERROR:", error);
    } else {
        console.log("SUCCESS:", user);
    }
}
test();
