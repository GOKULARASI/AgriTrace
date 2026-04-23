const supabase = require('../services/supabaseClient');
require('dotenv').config();

async function checkProducts() {
    const { data, error } = await supabase.from('products').select('*').limit(5);
    if (error) {
        console.error(error);
        return;
    }
    console.log("Current Products:");
    data.forEach(p => {
        console.log(`Product ID: ${p.product_id}, Batch ID: ${p.batch_id}, Status: ${p.current_status}`);
    });
}

checkProducts();
