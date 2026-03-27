const db = require('../db');

// Get user's notifications
const getNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const { limit = 20, offset = 0 } = req.query;

        const result = await db.query(
            `SELECT * FROM notifications 
             WHERE user_id = $1 
             ORDER BY created_at DESC 
             LIMIT $2 OFFSET $3`,
            [userId, limit, offset]
        );

        // Get unread count
        const unreadResult = await db.query(
            'SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND is_read = false',
            [userId]
        );

        res.json({
            success: true,
            notifications: result.rows,
            unreadCount: parseInt(unreadResult.rows[0].count),
            total: result.rows.length
        });
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
};

// Get unread count
const getUnreadCount = async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await db.query(
            'SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND is_read = false',
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

// Mark notification as read
const markAsRead = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        // Verify notification belongs to user
        const check = await db.query(
            'SELECT id FROM notifications WHERE id = $1 AND user_id = $2',
            [id, userId]
        );

        if (check.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Notification not found'
            });
        }

        await db.query(
            'UPDATE notifications SET is_read = true WHERE id = $1',
            [id]
        );

        res.json({
            success: true,
            message: 'Notification marked as read'
        });
    } catch (error) {
        console.error('Mark as read error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
};

// Mark all as read
const markAllAsRead = async (req, res) => {
    try {
        const userId = req.user.id;

        await db.query(
            'UPDATE notifications SET is_read = true WHERE user_id = $1 AND is_read = false',
            [userId]
        );

        res.json({
            success: true,
            message: 'All notifications marked as read'
        });
    } catch (error) {
        console.error('Mark all as read error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
};

// Delete notification
const deleteNotification = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const result = await db.query(
            'DELETE FROM notifications WHERE id = $1 AND user_id = $2 RETURNING id',
            [id, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Notification not found'
            });
        }

        res.json({
            success: true,
            message: 'Notification deleted'
        });
    } catch (error) {
        console.error('Delete notification error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
};

// Delete all notifications
const deleteAllNotifications = async (req, res) => {
    try {
        const userId = req.user.id;

        await db.query(
            'DELETE FROM notifications WHERE user_id = $1',
            [userId]
        );

        res.json({
            success: true,
            message: 'All notifications deleted'
        });
    } catch (error) {
        console.error('Delete all notifications error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
};

module.exports = {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications
};