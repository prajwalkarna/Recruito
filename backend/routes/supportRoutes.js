const express = require('express');
const router = express.Router();
const supportController = require('../controllers/supportController');
const { verifyToken } = require('../middleware/authMiddleware');

// All support routes require authentication
router.use(verifyToken);

router.post('/request', supportController.sendSupportRequest);

module.exports = router;
