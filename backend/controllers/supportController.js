const db = require('../db');
const { notifyNewMessage } = require('../services/notificationService');

exports.sendSupportRequest = async (req, res, next) => {
    try {
        const { topic, message } = req.body;
        const senderId = req.user.id; // From auth middleware
        const io = req.app.get('io');

        if (!topic || !message) {
            return res.status(400).json({ error: 'Topic and message are required' });
        }

        // 1. Find the first admin user
        const adminResult = await db.query(
            "SELECT id FROM users WHERE role = 'admin' LIMIT 1"
        );

        if (adminResult.rows.length === 0) {
            return res.status(404).json({ error: 'No admin found to handle the request' });
        }

        const receiverId = adminResult.rows[0].id;

        // 2. Create the message in the database
        // Note: The database schema uses 'message' in messageController.js but 'message_text' in database.sql
        // I'll check which one is currently in the DB.
        // Actually, based on previous view_file of messageController.js, it uses 'message'.
        const messageResult = await db.query(
            `INSERT INTO messages (sender_id, receiver_id, message)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [senderId, receiverId, `[Support Request: ${topic}]\n\n${message}`]
        );

        // 3. Trigger notification for the admin
        await notifyNewMessage(senderId, receiverId, io);

        res.status(201).json({
            success: true,
            message: 'Support request sent successfully',
            data: messageResult.rows[0]
        });
    } catch (error) {
        console.error('Support request error:', error);
        next(error);
    }
};
