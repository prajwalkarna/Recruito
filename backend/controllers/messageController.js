const db = require('../db');
const { notifyNewMessage } = require('../services/notificationService');
const { sendNewMessageEmail } = require('../services/emailService');

// ============================================
// SEND MESSAGE
// ============================================
const sendMessage = async (req, res) => {
    try {
        const senderId = req.user.id;
        const { receiver_id, message } = req.body;

        if (!receiver_id || !message) {
            return res.status(400).json({
                success: false,
                error: 'Receiver ID and message are required'
            });
        }

        // Check if receiver exists
        const receiverCheck = await db.query(
            'SELECT id FROM users WHERE id = $1',
            [receiver_id]
        );

        if (receiverCheck.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Receiver not found'
            });
        }

        // Insert message
        const result = await db.query(
            `INSERT INTO messages (sender_id, receiver_id, message)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [senderId, receiver_id, message]
        );

        // Emit real-time message via Socket.io
        const io = req.app.get('io');
        io.emit('new_message', {
            ...result.rows[0],
            sender_id: senderId,
            receiver_id
        });

        // 🆕 Send in-app notification
        notifyNewMessage(senderId, receiver_id, io);

        // 📧 Send email notification (respects preferences)
        sendNewMessageEmail(senderId, receiver_id, message);

        res.status(201).json({
            success: true,
            message: 'Message sent successfully',
            data: result.rows[0]
        });

    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
};

// ============================================
// GET CONVERSATIONS LIST
// ============================================
const getConversations = async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await db.query(
            `SELECT DISTINCT ON (other_user_id)
                other_user_id,
                other_user_name,
                last_message,
                last_message_time,
                is_read
             FROM (
                SELECT 
                    CASE 
                        WHEN sender_id = $1 THEN receiver_id 
                        ELSE sender_id 
                    END as other_user_id,
                    CASE 
                        WHEN sender_id = $1 THEN r.name 
                        ELSE s.name 
                    END as other_user_name,
                    message as last_message,
                    sent_at as last_message_time,
                    CASE 
                        WHEN receiver_id = $1 THEN is_read 
                        ELSE true 
                    END as is_read
                FROM messages m
                LEFT JOIN users s ON m.sender_id = s.id
                LEFT JOIN users r ON m.receiver_id = r.id
                WHERE sender_id = $1 OR receiver_id = $1
                ORDER BY sent_at DESC
             ) conversations
             ORDER BY other_user_id, last_message_time DESC`,
            [userId]
        );

        res.json({
            success: true,
            conversations: result.rows
        });

    } catch (error) {
        console.error('Get conversations error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
};

// ============================================
// GET MESSAGES WITH SPECIFIC USER
// ============================================
const getMessages = async (req, res) => {
    try {
        const userId = req.user.id;
        const { otherUserId } = req.params;

        const result = await db.query(
            `SELECT 
                m.*,
                s.name as sender_name,
                r.name as receiver_name
             FROM messages m
             LEFT JOIN users s ON m.sender_id = s.id
             LEFT JOIN users r ON m.receiver_id = r.id
             WHERE (sender_id = $1 AND receiver_id = $2) 
                OR (sender_id = $2 AND receiver_id = $1)
             ORDER BY sent_at ASC`,
            [userId, otherUserId]
        );

        // Mark messages as read
        await db.query(
            `UPDATE messages 
             SET is_read = true 
             WHERE receiver_id = $1 AND sender_id = $2 AND is_read = false`,
            [userId, otherUserId]
        );

        res.json({
            success: true,
            messages: result.rows
        });

    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
};

// ============================================
// GET UNREAD MESSAGE COUNT
// ============================================
const getUnreadCount = async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await db.query(
            `SELECT COUNT(*) as count 
             FROM messages 
             WHERE receiver_id = $1 AND is_read = false`,
            [userId]
        );

        res.json({
            success: true,
            unreadCount: parseInt(result.rows[0].count)
        });

    } catch (error) {
        console.error('Get unread count error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
};

// ============================================
// MARK CONVERSATION AS READ
// ============================================
const markAsRead = async (req, res) => {
    try {
        const userId = req.user.id;
        const { otherUserId } = req.params;

        await db.query(
            `UPDATE messages 
             SET is_read = true 
             WHERE receiver_id = $1 AND sender_id = $2`,
            [userId, otherUserId]
        );

        res.json({
            success: true,
            message: 'Messages marked as read'
        });

    } catch (error) {
        console.error('Mark as read error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
};

module.exports = {
    sendMessage,
    getConversations,
    getMessages,
    getUnreadCount,
    markAsRead
};