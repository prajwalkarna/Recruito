const express = require('express');
const router = express.Router();
const { 
    getEmployerDashboard, 
    getFreelancerDashboard 
} = require('../controllers/dashboardController');
const { verifyToken } = require('../middleware/authMiddleware');

// Both routes require authentication
router.get('/employer', verifyToken, getEmployerDashboard);
router.get('/freelancer', verifyToken, getFreelancerDashboard);

module.exports = router;