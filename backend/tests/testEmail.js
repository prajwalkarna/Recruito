require('dotenv').config();
const { sendEmail } = require('../config/email');

// Test email
const testEmail = async () => {
    console.log('📧 Testing email configuration...');
    console.log('Email user:', process.env.EMAIL_USER);

    const result = await sendEmail(
        process.env.EMAIL_USER, // Send to yourself
        'welcomeEmail',
        {
            name: 'Test User',
            role: 'freelancer'
        }
    );

    if (result.success) {
        console.log('✅ Test email sent successfully!');
        console.log('Message ID:', result.messageId);
    } else {
        console.log('❌ Failed to send email');
        console.log('Error:', result.error);
    }

    process.exit(0);
};

testEmail();