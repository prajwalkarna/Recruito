const { sendEmail } = require('../config/email');
const db = require('../db');

// Send application received email to employer
const sendApplicationReceivedEmail = async (applicationId) => {
    try {
        // Get application details
        const result = await db.query(
            `SELECT 
                a.*,
                j.title as job_title,
                j.id as job_id,
                f.name as applicant_name,
                f.email as applicant_email,
                e.name as employer_name,
                e.email as employer_email
             FROM applications a
             JOIN jobs j ON a.job_id = j.id
             JOIN users f ON a.freelancer_id = f.id
             JOIN users e ON j.employer_id = e.id
             WHERE a.id = $1`,
            [applicationId]
        );

        if (result.rows.length === 0) return;

        const app = result.rows[0];

        // Check if employer wants application emails
        const prefs = await getUserEmailPreferences(app.employer_id);
        if (!prefs.application_received) return;

        // Send email to employer
        await sendEmail(
            app.employer_email,
            'applicationReceived',
            {
                employerName: app.employer_name,
                jobTitle: app.job_title,
                jobId: app.job_id,
                applicantName: app.applicant_name,
                coverLetter: app.cover_letter
            }
        );

        console.log(`📧 Application received email sent to ${app.employer_email}`);
    } catch (error) {
        console.error('Send application email error:', error);
    }
};

// Send status change email to freelancer
const sendStatusChangeEmail = async (applicationId, newStatus) => {
    try {
        // Get application details
        const result = await db.query(
            `SELECT 
                a.*,
                j.title as job_title,
                f.name as applicant_name,
                f.email as applicant_email,
                e.name as employer_name
             FROM applications a
             JOIN jobs j ON a.job_id = j.id
             JOIN users f ON a.freelancer_id = f.id
             JOIN users e ON j.employer_id = e.id
             WHERE a.id = $1`,
            [applicationId]
        );

        if (result.rows.length === 0) return;

        const app = result.rows[0];

        // Check if freelancer wants status update emails
        const prefs = await getUserEmailPreferences(app.freelancer_id);
        if (!prefs.status_updates) return;

        // Send email to freelancer
        await sendEmail(
            app.applicant_email,
            'applicationStatusChanged',
            {
                applicantName: app.applicant_name,
                jobTitle: app.job_title,
                employerName: app.employer_name,
                status: newStatus
            }
        );

        console.log(`📧 Status change email sent to ${app.applicant_email}`);
    } catch (error) {
        console.error('Send status change email error:', error);
    }
};

// Send welcome email
const sendWelcomeEmail = async (userId) => {
    try {
        const result = await db.query(
            'SELECT name, email, role FROM users WHERE id = $1',
            [userId]
        );

        if (result.rows.length === 0) return;

        const user = result.rows[0];

        await sendEmail(
            user.email,
            'welcomeEmail',
            {
                name: user.name,
                role: user.role
            }
        );

        console.log(`📧 Welcome email sent to ${user.email}`);
    } catch (error) {
        console.error('Send welcome email error:', error);
    }
};

// Get user email preferences
const getUserEmailPreferences = async (userId) => {
    try {
        const result = await db.query(
            'SELECT email_preferences FROM user_settings WHERE user_id = $1',
            [userId]
        );

        if (result.rows.length === 0) {
            // Default preferences
            return {
                application_received: true,
                status_updates: true,
                new_messages: true,
                job_recommendations: true
            };
        }

        return result.rows[0].email_preferences || {
            application_received: true,
            status_updates: true,
            new_messages: true,
            job_recommendations: true
        };
    } catch (error) {
        console.error('Get email preferences error:', error);
        return {
            application_received: true,
            status_updates: true,
            new_messages: true,
            job_recommendations: true
        };
    }
};

// Send new message email
const sendNewMessageEmail = async (senderId, receiverId, message) => {
    try {
        // Get sender and receiver details
        const senderResult = await db.query('SELECT name FROM users WHERE id = $1', [senderId]);
        const receiverResult = await db.query('SELECT name, email FROM users WHERE id = $1', [receiverId]);

        if (senderResult.rows.length === 0 || receiverResult.rows.length === 0) return;

        const senderName = senderResult.rows[0].name;
        const receiverEmail = receiverResult.rows[0].email;

        // Check if receiver wants message emails
        const prefs = await getUserEmailPreferences(receiverId);
        if (!prefs.new_messages) return;

        // Send email
        await sendEmail(
            receiverEmail,
            'newMessage',
            {
                senderName,
                messagePreview: message.length > 100 ? message.substring(0, 100) + '...' : message
            }
        );

        console.log(`📧 New message email sent to ${receiverEmail}`);
    } catch (error) {
        console.error('Send message email error:', error);
    }
};

// Send new job alert email to all relevant freelancers
const sendNewJobAlertEmail = async (jobData) => {
    try {
        // Find all freelancers with job alerts enabled
        const freelancers = await db.query(`
            SELECT u.email, u.id 
            FROM users u
            JOIN user_settings us ON u.id = us.user_id
            WHERE u.role = 'freelancer' 
            AND (us.preferences->>'job_recommendations')::boolean = true
        `);

        if (freelancers.rows.length === 0) return;

        console.log(`📢 Sending job alerts to ${freelancers.rows.length} freelancers...`);

        // Send email to each freelancer
        // Note: For large volumes, use a queue or BCC
        for (const freelancer of freelancers.rows) {
            await sendEmail(
                freelancer.email,
                'newJobAlert',
                {
                    jobTitle: jobData.title,
                    companyName: jobData.companyName,
                    category: jobData.category,
                    budget: jobData.salary || jobData.budget || 'Not specified',
                    description: jobData.description
                }
            );
        }
    } catch (error) {
        console.error('Send job alert email error:', error);
    }
};

// Send password reset email
const sendPasswordResetEmail = async (user, resetUrl) => {
    try {
        await sendEmail(
            user.email,
            'passwordReset',
            {
                name: user.name,
                resetUrl: resetUrl
            }
        );

        console.log(`📧 Password reset email sent to ${user.email}`);
    } catch (error) {
        console.error('Send password reset email error:', error);
    }
};

module.exports = {
    sendApplicationReceivedEmail,
    sendStatusChangeEmail,
    sendWelcomeEmail,
    sendNewMessageEmail,
    sendNewJobAlertEmail,
    sendPasswordResetEmail,
    getUserEmailPreferences
};