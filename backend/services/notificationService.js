const db = require('../db');

// Create notification
const createNotification = async (userId, type, title, message, link = null) => {
    try {
        const result = await db.query(
            `INSERT INTO notifications (user_id, type, title, message, link)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [userId, type, title, message, link]
        );

        console.log(`🔔 Notification created for user ${userId}: ${title}`);
        return result.rows[0];
    } catch (error) {
        console.error('Create notification error:', error);
        return null;
    }
};

// Send application received notification (to employer)
const notifyApplicationReceived = async (applicationId, io) => {
    try {
        const result = await db.query(
            `SELECT 
                j.employer_id,
                j.title as job_title,
                j.id as job_id,
                u.name as applicant_name
             FROM applications a
             JOIN jobs j ON a.job_id = j.id
             JOIN users u ON a.freelancer_id = u.id
             WHERE a.id = $1`,
            [applicationId]
        );

        if (result.rows.length === 0) return;

        const data = result.rows[0];

        const notification = await createNotification(
            data.employer_id,
            'application_received',
            'New Application Received',
            `${data.applicant_name} applied for ${data.job_title}`,
            `/employer/job/${data.job_id}/applicants`
        );

        // Emit real-time notification via Socket.io
        if (notification && io) {
            io.emit('new_notification', {
                userId: data.employer_id,
                notification
            });
        }

        return notification;
    } catch (error) {
        console.error('Notify application received error:', error);
    }
};

// Send status change notification (to freelancer)
const notifyStatusChange = async (applicationId, newStatus, io) => {
    try {
        const result = await db.query(
            `SELECT 
                a.freelancer_id,
                j.title as job_title,
                a.id as application_id
             FROM applications a
             JOIN jobs j ON a.job_id = j.id
             WHERE a.id = $1`,
            [applicationId]
        );

        if (result.rows.length === 0) return;

        const data = result.rows[0];

        const statusMessages = {
            accepted: '🎉 Your application has been accepted!',
            rejected: 'Your application was not selected',
            shortlisted: '⭐ You have been shortlisted!',
            pending: 'Your application is under review'
        };

        const notification = await createNotification(
            data.freelancer_id,
            'status_change',
            `Application ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`,
            `${statusMessages[newStatus]} for ${data.job_title}`,
            `/freelancer/my-applications`
        );

        // Emit real-time notification via Socket.io
        if (notification && io) {
            io.emit('new_notification', {
                userId: data.freelancer_id,
                notification
            });
        }

        return notification;
    } catch (error) {
        console.error('Notify status change error:', error);
    }
};

// Send new message notification
const notifyNewMessage = async (senderId, receiverId, io) => {
    try {
        const result = await db.query(
            'SELECT name FROM users WHERE id = $1',
            [senderId]
        );

        if (result.rows.length === 0) return;

        const senderName = result.rows[0].name;

        const notification = await createNotification(
            receiverId,
            'new_message',
            'New Message',
            `${senderName} sent you a message`,
            `/messages`
        );

        // Emit real-time notification via Socket.io
        if (notification && io) {
            io.emit('new_notification', {
                userId: receiverId,
                notification
            });
        }

        return notification;
    } catch (error) {
        console.error('Notify new message error:', error);
    }
};

// Send job saved notification (optional - for employer)
const notifyJobSaved = async (jobId, userId, io) => {
    try {
        const result = await db.query(
            `SELECT 
                j.employer_id,
                j.title as job_title,
                u.name as user_name
             FROM jobs j
             JOIN users u ON u.id = $2
             WHERE j.id = $1`,
            [jobId, userId]
        );

        if (result.rows.length === 0) return;

        const data = result.rows[0];

        const notification = await createNotification(
            data.employer_id,
            'job_saved',
            'Job Bookmarked',
            `${data.user_name} saved your job: ${data.job_title}`,
            `/employer/my-jobs`
        );

        // Emit real-time notification via Socket.io
        if (notification && io) {
            io.emit('new_notification', {
                userId: data.employer_id,
                notification
            });
        }

        return notification;
    } catch (error) {
        console.error('Notify job saved error:', error);
    }
};

module.exports = {
    createNotification,
    notifyApplicationReceived,
    notifyStatusChange,
    notifyNewMessage,
    notifyJobSaved
};