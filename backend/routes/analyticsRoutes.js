const express = require('express');
const router = express.Router();
const {
    // Employer
    getEmployerStats,
    getApplicationsOverTime,
    getTopJobs,
    getApplicationStatusDistribution,
    getRecentActivity,

    // Freelancer
    getFreelancerStats,
    getFreelancerApplicationsOverTime,
    getFreelancerStatusDistribution,
    getFreelancerRecentActivity
} = require('../controllers/analyticsController');
const { verifyToken } = require('../middleware/authMiddleware');

// Employer analytics
router.get('/employer/stats', verifyToken, getEmployerStats);
router.get('/employer/applications-over-time', verifyToken, getApplicationsOverTime);
router.get('/employer/top-jobs', verifyToken, getTopJobs);
router.get('/employer/status-distribution', verifyToken, getApplicationStatusDistribution);
router.get('/employer/recent-activity', verifyToken, getRecentActivity);

// Freelancer analytics
router.get('/freelancer/stats', verifyToken, getFreelancerStats);
router.get('/freelancer/applications-over-time', verifyToken, getFreelancerApplicationsOverTime);
router.get('/freelancer/status-distribution', verifyToken, getFreelancerStatusDistribution);
router.get('/freelancer/recent-activity', verifyToken, getFreelancerRecentActivity);

module.exports = router;