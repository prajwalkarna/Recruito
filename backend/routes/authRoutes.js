const express = require('express');
const router = express.Router();
const { register, login, forgotPassword, resetPassword } = require('../controllers/authController');

const { authLimiter, registerLimiter } = require('../middleware/security');
const { validateRegister, validateLogin } = require('../middleware/validators');

// Apply rate limiting and validation
router.post('/register', registerLimiter, validateRegister, register);
router.post('/login', authLimiter, validateLogin, login);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password/:token', authLimiter, resetPassword);

module.exports = router;