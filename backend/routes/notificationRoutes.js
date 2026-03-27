const express = require('express');
const router = express.Router();
const {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications
} = require('../controllers/notificationController');
const { verifyToken } = require('../middleware/authMiddleware');
const { validateId } = require('../middleware/validators');

// All routes require authentication
router.get('/', verifyToken, getNotifications);
router.get('/unread-count', verifyToken, getUnreadCount);
router.put('/:id/read', verifyToken, validateId, markAsRead);
router.put('/read-all', verifyToken, markAllAsRead);
router.delete('/:id', verifyToken, validateId, deleteNotification);
router.delete('/', verifyToken, deleteAllNotifications);

module.exports = router;