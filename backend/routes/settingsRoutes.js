const express = require('express');
const router = express.Router();
const {
    getSettings,
    updateAccountInfo,
    changeEmail,
    changePassword,
    updateNotificationSettings,
    deactivateAccount,
    reactivateAccount,
    deleteAccount,
    exportUserData,
    getThemePreferences,
    updateThemePreferences
} = require('../controllers/settingsController');
const { verifyToken } = require('../middleware/authMiddleware');
const { body } = require('express-validator');
const { handleValidationErrors } = require('../middleware/validators');

// Validation middleware
const validateAccountInfo = [
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
    handleValidationErrors
];

const validateChangeEmail = [
    body('new_email')
        .trim()
        .isEmail().withMessage('Invalid email format')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('Password is required'),
    handleValidationErrors
];

const validateChangePassword = [
    body('current_password')
        .notEmpty().withMessage('Current password is required'),
    body('new_password')
        .isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain uppercase, lowercase, and number'),
    handleValidationErrors
];

// Routes
router.get('/', verifyToken, getSettings);
router.put('/account', verifyToken, validateAccountInfo, updateAccountInfo);
router.put('/email', verifyToken, validateChangeEmail, changeEmail);
router.put('/password', verifyToken, validateChangePassword, changePassword);
router.put('/notifications', verifyToken, updateNotificationSettings);
router.post('/deactivate', verifyToken, deactivateAccount);
router.post('/reactivate', reactivateAccount);
router.delete('/delete', verifyToken, deleteAccount);
router.get('/export', verifyToken, exportUserData);

// Theme preferences
router.get('/theme', verifyToken, getThemePreferences);
router.put('/theme', verifyToken, updateThemePreferences);

module.exports = router;