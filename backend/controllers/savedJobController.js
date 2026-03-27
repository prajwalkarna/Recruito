const db = require('../db');

// ============================================
// SAVE A JOB (Bookmark)
// ============================================
const saveJob = async (req, res) => {
    try {
        const userId = req.user.id;
        const { job_id } = req.body;

        if (!job_id) {
            return res.status(400).json({
                success: false,
                error: 'Job ID is required'
            });
        }

        // Check if job exists
        const jobCheck = await db.query(
            'SELECT id, status FROM jobs WHERE id = $1',
            [job_id]
        );

        if (jobCheck.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Job not found'
            });
        }

        // Check if already saved
        const existingCheck = await db.query(
            'SELECT id FROM saved_jobs WHERE user_id = $1 AND job_id = $2',
            [userId, job_id]
        );

        if (existingCheck.rows.length > 0) {
            return res.status(400).json({
                success: false,
                error: 'Job already saved'
            });
        }

        // Save the job
        const result = await db.query(
            'INSERT INTO saved_jobs (user_id, job_id) VALUES ($1, $2) RETURNING *',
            [userId, job_id]
        );

        res.status(201).json({
            success: true,
            message: 'Job saved successfully',
            savedJob: result.rows[0]
        });

    } catch (error) {
        console.error('Save job error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
};

// ============================================
// GET ALL SAVED JOBS
// ============================================
const getSavedJobs = async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await db.query(
            `SELECT 
                sj.id as saved_id,
                sj.saved_at,
                j.*,
                u.name as employer_name,
                u.email as employer_email,
                c.name as category_name,
                (SELECT COUNT(*) FROM applications WHERE job_id = j.id) as application_count
             FROM saved_jobs sj
             JOIN jobs j ON sj.job_id = j.id
             LEFT JOIN users u ON j.employer_id = u.id
             LEFT JOIN job_categories c ON j.category_id = c.id
             WHERE sj.user_id = $1
             ORDER BY sj.saved_at DESC`,
            [userId]
        );

        res.json({
            success: true,
            savedJobs: result.rows,
            total: result.rows.length
        });

    } catch (error) {
        console.error('Get saved jobs error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
};

// ============================================
// UNSAVE A JOB (Remove bookmark)
// ============================================
const unsaveJob = async (req, res) => {
    try {
        const userId = req.user.id;
        const { job_id } = req.params;

        // Check if the saved job exists
        const check = await db.query(
            'SELECT id FROM saved_jobs WHERE user_id = $1 AND job_id = $2',
            [userId, job_id]
        );

        if (check.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Saved job not found'
            });
        }

        // Remove the saved job
        await db.query(
            'DELETE FROM saved_jobs WHERE user_id = $1 AND job_id = $2',
            [userId, job_id]
        );

        res.json({
            success: true,
            message: 'Job removed from saved list'
        });

    } catch (error) {
        console.error('Unsave job error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
};

// ============================================
// CHECK IF JOB IS SAVED
// ============================================
const checkIfSaved = async (req, res) => {
    try {
        const userId = req.user.id;
        const { job_id } = req.params;

        const result = await db.query(
            'SELECT id FROM saved_jobs WHERE user_id = $1 AND job_id = $2',
            [userId, job_id]
        );

        res.json({
            success: true,
            isSaved: result.rows.length > 0
        });

    } catch (error) {
        console.error('Check saved error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
};

module.exports = {
    saveJob,
    getSavedJobs,
    unsaveJob,
    checkIfSaved
};