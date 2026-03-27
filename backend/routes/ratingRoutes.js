const express = require('express');
const router = express.Router();
const { 
    createRating, 
    getFreelancerRatings, 
    getAverageRating 
} = require('../controllers/ratingController');
const { verifyToken } = require('../middleware/authMiddleware');

// Public routes
router.get('/freelancer/:id', getFreelancerRatings);
router.get('/freelancer/:id/average', getAverageRating);

// Protected routes (Employer only)
router.post('/', verifyToken, createRating);

module.exports = router;
