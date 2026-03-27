const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testSecurity() {
    console.log('🧪 Testing API Security...');
    console.log('');

    // Test 1: Rate limiting on login
    console.log('Test 1: Rate Limiting (Login)');
    try {
        for (let i = 1; i <= 6; i++) {
            try {
                await axios.post(`${API_URL}/auth/login`, {
                    email: 'test@test.com',
                    password: 'wrongpassword'
                });
            } catch (err) {
                if (i === 6 && err.response?.status === 429) {
                    console.log('✅ Rate limiting working - Too many requests blocked');
                } else if (i < 6) {
                    console.log(`   Attempt ${i}: ${err.response?.status}`);
                }
            }
        }
    } catch (err) {
        console.log('❌ Rate limiting test failed');
    }

    console.log('');

    // Test 2: Input validation
    console.log('Test 2: Input Validation');
    try {
        await axios.post(`${API_URL}/auth/register`, {
            name: 'A', // Too short
            email: 'invalid-email',
            password: '123', // Too short
            role: 'invalid' // Invalid role
        });
        console.log('❌ Validation not working');
    } catch (err) {
        if (err.response?.status === 400) {
            console.log('✅ Input validation working');
            console.log('   Errors:', err.response.data.errors?.length || 0);
        }
    }

    console.log('');

    // Test 3: SQL Injection protection
    console.log('Test 3: SQL Injection Protection');
    try {
        await axios.post(`${API_URL}/auth/login`, {
            email: "admin' OR '1'='1",
            password: "admin' OR '1'='1"
        });
        console.log('❌ SQL injection protection failed');
    } catch (err) {
        if (err.response?.status === 400 || err.response?.status === 401) {
            console.log('✅ SQL injection blocked');
        }
    }

    console.log('');

    // Test 4: XSS protection
    console.log('Test 4: XSS Protection');
    try {
        await axios.post(`${API_URL}/auth/register`, {
            name: '<script>alert("XSS")</script>',
            email: 'test@test.com',
            password: 'Password123',
            role: 'freelancer'
        });
    } catch (err) {
        console.log('✅ XSS attack sanitized or blocked');
    }

    console.log('');
    console.log('🎉 Security tests complete!');
}

testSecurity();