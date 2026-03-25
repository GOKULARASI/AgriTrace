const axios = require('axios');

async function test() {
    try {
        const res = await axios.post('https://agritrace-2qjx.onrender.com/api/auth/register', {
            name: "Test User",
            email: "test_" + Date.now() + "@example.com",
            password: "password123",
            role: "Farmer",
            location: "Test Location",
            phone: "1234567890"
        });
        console.log('SUCCESS:', res.data);
    } catch (err) {
        console.log('ERROR STATUS:', err.response?.status);
        console.log('ERROR DATA:', err.response?.data);
    }
}

test();
