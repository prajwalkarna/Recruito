const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
    // For development: Use Gmail or Ethereal (fake SMTP)
    // For production: Use SendGrid, AWS SES, or other service

    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: process.env.EMAIL_PORT || 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });
};

// Email templates
const emailTemplates = {
    // Application submitted - to employer
    applicationReceived: (data) => ({
        subject: `New Application for ${data.jobTitle}`,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
                    .button { display: inline-block; padding: 12px 30px; background-color: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
                    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
                    .info-box { background: white; padding: 15px; border-left: 4px solid #667eea; margin: 20px 0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>📨 New Application Received</h1>
                    </div>
                    <div class="content">
                        <p>Hello <strong>${data.employerName}</strong>,</p>
                        
                        <p>You have received a new application for your job posting:</p>
                        
                        <div class="info-box">
                            <strong>Job:</strong> ${data.jobTitle}<br>
                            <strong>Applicant:</strong> ${data.applicantName}<br>
                            <strong>Applied on:</strong> ${new Date().toLocaleDateString()}
                        </div>
                        
                        ${data.coverLetter ? `
                            <p><strong>Cover Letter:</strong></p>
                            <p style="background: white; padding: 15px; border-radius: 5px; font-style: italic;">
                                "${data.coverLetter.substring(0, 200)}${data.coverLetter.length > 200 ? '...' : ''}"
                            </p>
                        ` : ''}
                        
                        <p>Review the application and respond to the candidate.</p>
                        
                        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/employer/job/${data.jobId}/applicants" class="button">
                            View Application
                        </a>
                    </div>
                    <div class="footer">
                        <p>This is an automated email from Recruito</p>
                        <p>© ${new Date().getFullYear()} Recruito. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `
    }),

    // Application status changed - to freelancer
    applicationStatusChanged: (data) => {
        const statusColors = {
            accepted: '#48bb78',
            rejected: '#f56565',
            shortlisted: '#ecc94b',
            pending: '#718096'
        };

        const statusMessages = {
            accepted: '🎉 Congratulations! Your application has been accepted.',
            rejected: '😔 Unfortunately, your application was not selected this time.',
            shortlisted: '⭐ Great news! You have been shortlisted.',
            pending: '⏳ Your application is under review.'
        };

        return {
            subject: `Application Update: ${data.jobTitle}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
                        .status-badge { display: inline-block; padding: 8px 20px; background-color: ${statusColors[data.status]}; color: white; border-radius: 20px; font-weight: bold; margin: 20px 0; }
                        .button { display: inline-block; padding: 12px 30px; background-color: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
                        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
                        .info-box { background: white; padding: 15px; border-left: 4px solid ${statusColors[data.status]}; margin: 20px 0; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>📬 Application Status Update</h1>
                        </div>
                        <div class="content">
                            <p>Hello <strong>${data.applicantName}</strong>,</p>
                            
                            <p>${statusMessages[data.status]}</p>
                            
                            <div style="text-align: center;">
                                <span class="status-badge">${data.status.toUpperCase()}</span>
                            </div>
                            
                            <div class="info-box">
                                <strong>Job:</strong> ${data.jobTitle}<br>
                                <strong>Company:</strong> ${data.employerName}<br>
                                <strong>Status:</strong> ${data.status.charAt(0).toUpperCase() + data.status.slice(1)}
                            </div>
                            
                            ${data.status === 'accepted' ? `
                                <p><strong>Next Steps:</strong></p>
                                <p>The employer may contact you soon regarding the next steps in the hiring process. Keep an eye on your messages!</p>
                            ` : ''}
                            
                            ${data.status === 'rejected' ? `
                                <p>Don't be discouraged! Keep applying and improving your skills. The right opportunity is waiting for you.</p>
                            ` : ''}
                            
                            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/freelancer/my-applications" class="button">
                                View All Applications
                            </a>
                        </div>
                        <div class="footer">
                            <p>This is an automated email from Recruito</p>
                            <p>© ${new Date().getFullYear()} Recruito. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };
    },

    // Welcome email
    welcomeEmail: (data) => ({
        subject: 'Welcome to Recruito! 🎉',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; text-align: center; border-radius: 8px 8px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
                    .button { display: inline-block; padding: 12px 30px; background-color: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
                    .feature { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #667eea; }
                    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🎉 Welcome to Recruito!</h1>
                        <p>Your journey to finding the perfect opportunity starts here</p>
                    </div>
                    <div class="content">
                        <p>Hello <strong>${data.name}</strong>,</p>
                        
                        <p>Thank you for joining Recruito! We're excited to help you ${data.role === 'freelancer' ? 'find your dream job' : 'hire talented professionals'}.</p>
                        
                        ${data.role === 'freelancer' ? `
                            <div class="feature">
                                <strong>📄 Build Your CV</strong><br>
                                Create professional CVs with our easy-to-use builder
                            </div>
                            <div class="feature">
                                <strong>🔍 Browse Jobs</strong><br>
                                Search thousands of job opportunities
                            </div>
                            <div class="feature">
                                <strong>📨 Apply Easily</strong><br>
                                Submit applications with just a few clicks
                            </div>
                            <div class="feature">
                                <strong>💼 Showcase Your Work</strong><br>
                                Build a portfolio to stand out
                            </div>
                        ` : `
                            <div class="feature">
                                <strong>📝 Post Jobs</strong><br>
                                Create and manage job listings easily
                            </div>
                            <div class="feature">
                                <strong>👥 Review Applicants</strong><br>
                                View applications and manage candidates
                            </div>
                            <div class="feature">
                                <strong>💬 Direct Messaging</strong><br>
                                Communicate with candidates in real-time
                            </div>
                            <div class="feature">
                                <strong>📊 Track Progress</strong><br>
                                Monitor your job postings and applications
                            </div>
                        `}
                        
                        <p style="margin-top: 30px;">Ready to get started?</p>
                        
                        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard" class="button">
                            Go to Dashboard
                        </a>
                    </div>
                    <div class="footer">
                        <p>Need help? Contact us at support@recruito.com</p>
                        <p>© ${new Date().getFullYear()} Recruito. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `
    }),

    // New Message notification
    newMessage: (data) => ({
        subject: `New Message from ${data.senderName}`,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
                    .message-box { background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; margin: 20px 0; font-style: italic; }
                    .button { display: inline-block; padding: 12px 30px; background-color: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
                    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>💬 New Message Received</h1>
                    </div>
                    <div class="content">
                        <p>Hello,</p>
                        <p>You have received a new message from <strong>${data.senderName}</strong>:</p>
                        
                        <div class="message-box">
                            "${data.messagePreview}"
                        </div>
                        
                        <p>Click below to view the full conversation and reply.</p>
                        
                        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/messages" class="button">
                            Reply to Message
                        </a>
                    </div>
                    <div class="footer">
                        <p>You received this because you have email notifications enabled for new messages.</p>
                        <p>© ${new Date().getFullYear()} Recruito. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `
    }),

    // New Job Alert
    newJobAlert: (data) => ({
        subject: `New Job Opportunity: ${data.jobTitle}`,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
                    .job-card { background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; margin: 20px 0; }
                    .button { display: inline-block; padding: 12px 30px; background-color: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
                    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
                    .badge { display: inline-block; padding: 4px 12px; background: #ebf4ff; color: #667eea; border-radius: 12px; font-size: 12px; font-weight: bold; margin-bottom: 10px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🚀 New Job Posted!</h1>
                    </div>
                    <div class="content">
                        <p>Hello,</p>
                        <p>A new job has been posted that matches your interests:</p>
                        
                        <div class="job-card">
                            <span class="badge">${data.category}</span>
                            <h2 style="margin: 0 0 10px 0;">${data.jobTitle}</h2>
                            <p style="margin: 5px 0;"><strong>Company:</strong> ${data.companyName}</p>
                            <p style="margin: 5px 0;"><strong>Budget/Salary:</strong> ${data.budget}</p>
                            <p style="margin: 15px 0; color: #666; font-size: 14px;">
                                ${data.description.substring(0, 150)}...
                            </p>
                        </div>
                        
                        <p>Be among the first to apply and stand out!</p>
                        
                        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/freelancer/browse-jobs" class="button">
                            View Job Details
                        </a>
                    </div>
                    <div class="footer">
                        <p>You received this because you have "New Job Alerts" enabled.</p>
                        <p>© ${new Date().getFullYear()} Recruito. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `
    }),
    
    // Password reset email
    passwordReset: (data) => ({
        subject: 'Reset Your Recruito Password',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #47d6ff 0%, #0072ff 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
                    .button { display: inline-block; padding: 12px 30px; background-color: #47d6ff; color: #000; text-decoration: none; border-radius: 5px; margin-top: 20px; font-weight: bold; }
                    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
                    .warning { font-size: 12px; color: #999; margin-top: 20px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🔐 Password Recovery</h1>
                    </div>
                    <div class="content">
                        <p>Hello <strong>${data.name}</strong>,</p>
                        
                        <p>We received a request to reset your Recruito account password. If you didn't make this request, you can safely ignore this email.</p>
                        
                        <p>To reset your password, click the high-priority action button below:</p>
                        
                        <a href="${data.resetUrl}" class="button">Reset Password</a>
                        
                        <p class="warning italic">This link will expire in 1 hour for security purposes.</p>
                    </div>
                    <div class="footer">
                        <p>This is an automated security protocol from Recruito</p>
                        <p>© ${new Date().getFullYear()} Recruito. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `
    })
};


// Send email function
const sendEmail = async (to, template, data) => {
    try {
        const transporter = createTransporter();
        const emailContent = emailTemplates[template](data);

        const info = await transporter.sendMail({
            from: `"Recruito" <${process.env.EMAIL_USER}>`,
            to: to,
            subject: emailContent.subject,
            html: emailContent.html
        });

        console.log('✅ Email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Email error:', error);
        return { success: false, error: error.message };
    }
};

module.exports = { sendEmail, emailTemplates };