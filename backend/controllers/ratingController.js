const db = require('../db');

// @desc    Create a new rating
// @route   POST /api/ratings
// @access  Private (Employer)
const createRating = async (req, res) => {
    const employer_id = req.user.id;
    const { freelancer_id, job_id, rating, review } = req.body;

    // Validate input
    if (!freelancer_id || !rating) {
        return res.status(400).json({ 
            success: false, 
            message: 'Freelancer ID and rating are required.' 
        });
    }

    if (rating < 1 || rating > 5) {
        return res.status(400).json({ 
            success: false, 
            message: 'Rating must be between 1 and 5.' 
        });
    }

    try {
        // Verify the freelancer exists
        const userCheck = await db.query('SELECT id, role FROM users WHERE id = $1', [freelancer_id]);
        if (userCheck.rows.length === 0 || userCheck.rows[0].role !== 'freelancer') {
            return res.status(404).json({ 
                success: false, 
                message: 'Freelancer not found.' 
            });
        }

        // Insert rating
        const result = await db.query(
            `INSERT INTO ratings (freelancer_id, employer_id, job_id, rating, review)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [freelancer_id, employer_id, job_id || null, rating, review || null]
        );

        res.status(201).json({
            success: true,
            message: 'Rating submitted successfully.',
            rating: result.rows[0]
        });
    } catch (err) {
        // Unique violation check (one rating per employer/freelancer/job combination)
        if (err.code === '23505') {
            return res.status(409).json({ 
                success: false, 
                message: 'You have already rated this freelancer for this job.' 
            });
        }
        console.error('createRating error:', err);
        res.status(500).json({ 
            success: false, 
            message: 'Server error while creating rating.' 
        });
    }
};

// @desc    Get all ratings for a freelancer
// @route   GET /api/ratings/freelancer/:id
// @access  Public
const getFreelancerRatings = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await db.query(
            `SELECT r.*, u.name as employer_name, u.profile_picture as employer_picture
             FROM ratings r
             JOIN users u ON r.employer_id = u.id
             WHERE r.freelancer_id = $1
             ORDER BY r.created_at DESC`,
            [id]
        );

        res.json({
            success: true,
            ratings: result.rows
        });
    } catch (err) {
        console.error('getFreelancerRatings error:', err);
        res.status(500).json({ 
            success: false, 
            message: 'Server error while fetching ratings.' 
        });
    }
};

// @desc    Get average rating for a freelancer
// @route   GET /api/ratings/freelancer/:id/average
// @access  Public
const getAverageRating = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await db.query(
            `SELECT 
                ROUND(AVG(rating), 1) as average_rating,
                COUNT(*) as total_reviews
             FROM ratings
             WHERE freelancer_id = $1`,
            [id]
        );

        const data = result.rows[0];
        res.json({
            success: true,
            average_rating: parseFloat(data.average_rating) || 0,
            total_reviews: parseInt(data.total_reviews) || 0
        });
    } catch (err) {
        console.error('getAverageRating error:', err);
        res.status(500).json({ 
            success: false, 
            message: 'Server error while fetching average rating.' 
        });
    }
};

module.exports = {
    createRating,
    getFreelancerRatings,
    getAverageRating
};
