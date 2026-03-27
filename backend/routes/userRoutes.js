const express = require('express');
const router = express.Router();
const {
    getUserProfile,
    updateUserProfile,
    changePassword,
    getPublicProfile
} = require('../controllers/userController');
const { verifyToken } = require('../middleware/authMiddleware');
const db = require('../db');

const { validateId } = require('../middleware/validators');

// Public profile (anyone can view)
router.get('/:id/public', validateId, getPublicProfile);

// Protected routes (require authentication)
router.get('/:id', verifyToken, validateId, getUserProfile);
router.put('/:id', verifyToken, validateId, updateUserProfile);
router.put('/:id/password', verifyToken, validateId, changePassword);

// 🆕 Email preferences routes
router.get('/email-preferences', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await db.query(
            'SELECT email_preferences FROM user_settings WHERE user_id = $1',
            [userId]
        );

        if (result.rows.length === 0) {
            return res.json({
                success: true,
                preferences: {
                    application_received: true,
                    status_updates: true,
                    new_messages: true,
                    job_recommendations: true
                }
            });
        }

        res.json({
            success: true,
            preferences: result.rows[0].email_preferences || {
                application_received: true,
                status_updates: true,
                new_messages: true,
                job_recommendations: true
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

router.put('/email-preferences', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { preferences } = req.body;

        const check = await db.query(
            'SELECT id FROM user_settings WHERE user_id = $1',
            [userId]
        );

        if (check.rows.length === 0) {
            await db.query(
                'INSERT INTO user_settings (user_id, email_preferences) VALUES ($1, $2)',
                [userId, JSON.stringify(preferences)]
            );
        } else {
            await db.query(
                'UPDATE user_settings SET email_preferences = $1 WHERE user_id = $2',
                [JSON.stringify(preferences), userId]
            );
        }

        res.json({
            success: true,
            message: 'Email preferences updated',
            preferences
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

module.exports = router;