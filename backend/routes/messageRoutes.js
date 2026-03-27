const express = require('express');
const router = express.Router();
const {
    sendMessage,
    getConversations,
    getMessages,
    getUnreadCount,
    markAsRead
} = require('../controllers/messageController');
const { verifyToken } = require('../middleware/authMiddleware');
const { validateMessage, validateOtherUserId } = require('../middleware/validators');

// All routes require authentication
router.post('/', verifyToken, validateMessage, sendMessage);
router.get('/conversations', verifyToken, getConversations);
router.get('/unread-count', verifyToken, getUnreadCount);
router.get('/:otherUserId', verifyToken, validateOtherUserId, getMessages);
router.put('/:otherUserId/read', verifyToken, validateOtherUserId, markAsRead);

module.exports = router;