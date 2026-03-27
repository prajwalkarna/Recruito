const db = require('../db');
const { sendNewJobAlertEmail } = require('../services/emailService');

// ─── CREATE JOB ───────────────────────────────────────────────
const createJob = async (req, res) => {
    const employer_id = req.user.id;
    const {
        title,
        description,
        category_id,
        location,
        salary_min,
        salary_max,
        job_type,
        experience_level,
        required_skills,
        expires_at,
    } = req.body;

    // Validation
    if (!title || !description || !job_type) {
        return res.status(400).json({ message: 'Title, description, and job type are required.' });
    }

    const validJobTypes = ['full-time', 'part-time', 'contract', 'freelance'];
    if (!validJobTypes.includes(job_type)) {
        return res.status(400).json({ message: 'Invalid job type.' });
    }

    if (salary_min && salary_max && Number(salary_min) > Number(salary_max)) {
        return res.status(400).json({ message: 'salary_min cannot be greater than salary_max.' });
    }

    try {
        const result = await db.query(
            `INSERT INTO jobs 
                (employer_id, category_id, title, description, location, salary_min, salary_max, job_type, experience_level, required_skills, expires_at)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
             RETURNING *`,
            [
                employer_id,
                category_id || null,
                title,
                description,
                location || null,
                salary_min || null,
                salary_max || null,
                job_type,
                experience_level || 'any',
                required_skills ? JSON.stringify(required_skills) : null,
                expires_at && expires_at.trim() !== '' ? expires_at : null,
            ]
        );

        res.status(201).json({
            message: 'Job created successfully.',
            job: result.rows[0],
        });

        // 📢 Send Job Alerts to relevant freelancers
        try {
            const job = result.rows[0];
            // Get employer and category names for the email
            const extraInfo = await db.query(`
                SELECT u.name as company_name, c.name as category_name
                FROM users u
                LEFT JOIN job_categories c ON c.id = $2
                WHERE u.id = $1
            `, [employer_id, category_id]);

            const companyName = extraInfo.rows[0]?.company_name || 'A Company';
            const categoryName = extraInfo.rows[0]?.category_name || 'General';

            sendNewJobAlertEmail({
                ...job,
                companyName,
                category: categoryName
            });
        } catch (emailErr) {
            console.error('Job alert trigger error:', emailErr);
        }
    } catch (err) {
        console.error('createJob error:', err);
        res.status(500).json({ message: 'Server error while creating job.' });
    }
};

// ─── GET ALL JOBS (public + employer's own) ───────────────────
const getAllJobs = async (req, res) => {
    try {
        const result = await db.query(
            `SELECT j.*, 
                    u.name AS employer_name, 
                    u.profile_picture AS employer_picture,
                    jc.name AS category_name
             FROM jobs j
             LEFT JOIN users u ON j.employer_id = u.id
             LEFT JOIN job_categories jc ON j.category_id = jc.id
             WHERE j.status = 'active'
             ORDER BY j.created_at DESC`
        );

        res.json({ jobs: result.rows });
    } catch (err) {
        console.error('getAllJobs error:', err);
        res.status(500).json({ message: 'Server error while fetching jobs.' });
    }
};

// ─── GET JOBS BY EMPLOYER (employer's own listings) ──────────
const getMyJobs = async (req, res) => {
    const employer_id = req.user.id;

    try {
        const result = await db.query(
            `SELECT j.*, 
                    jc.name AS category_name,
                    COUNT(a.id) AS applicant_count
             FROM jobs j
             LEFT JOIN job_categories jc ON j.category_id = jc.id
             LEFT JOIN applications a ON j.id = a.job_id
             WHERE j.employer_id = $1
             GROUP BY j.id, jc.name
             ORDER BY j.created_at DESC`,
            [employer_id]
        );

        res.json({ jobs: result.rows });
    } catch (err) {
        console.error('getMyJobs error:', err);
        res.status(500).json({ message: 'Server error while fetching your jobs.' });
    }
};

// ─── GET SINGLE JOB ──────────────────────────────────────────
const getJobById = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await db.query(
            `SELECT j.*, 
                    u.name AS employer_name,
                    u.profile_picture AS employer_picture,
                    u.bio AS employer_bio,
                    jc.name AS category_name
             FROM jobs j
             LEFT JOIN users u ON j.employer_id = u.id
             LEFT JOIN job_categories jc ON j.category_id = jc.id
             WHERE j.id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Job not found.' });
        }

        // Increment view count
        await db.query('UPDATE jobs SET views_count = views_count + 1 WHERE id = $1', [id]);

        res.json({ job: result.rows[0] });
    } catch (err) {
        console.error('getJobById error:', err);
        res.status(500).json({ message: 'Server error while fetching job.' });
    }
};

// ─── UPDATE JOB ──────────────────────────────────────────────
const updateJob = async (req, res) => {
    const { id } = req.params;
    const employer_id = req.user.id;
    const {
        title,
        description,
        category_id,
        location,
        salary_min,
        salary_max,
        job_type,
        experience_level,
        required_skills,
        status,
        expires_at,
    } = req.body;

    try {
        // Check job exists and belongs to this employer
        const existing = await db.query(
            'SELECT * FROM jobs WHERE id = $1', [id]
        );

        if (existing.rows.length === 0) {
            return res.status(404).json({ message: 'Job not found.' });
        }

        if (existing.rows[0].employer_id !== employer_id) {
            return res.status(403).json({ message: 'You can only edit your own job listings.' });
        }

        const validStatuses = ['active', 'closed', 'pending'];
        if (status && !validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status value.' });
        }

        // FIX: expires_at cannot use COALESCE because an empty string "" is not null,
        // so COALESCE would keep the old value even when a new date is submitted.
        // We directly assign $11 after normalising empty strings to null.
        // This also allows clearing the deadline by submitting an empty date field.
        const expiresAtValue = expires_at && expires_at.trim() !== '' ? expires_at : null;

        const result = await db.query(
            `UPDATE jobs SET
                title            = COALESCE($1, title),
                description      = COALESCE($2, description),
                category_id      = COALESCE($3, category_id),
                location         = COALESCE($4, location),
                salary_min       = COALESCE($5, salary_min),
                salary_max       = COALESCE($6, salary_max),
                job_type         = COALESCE($7, job_type),
                experience_level = COALESCE($8, experience_level),
                required_skills  = COALESCE($9, required_skills),
                status           = COALESCE($10, status),
                expires_at       = $11,
                updated_at       = CURRENT_TIMESTAMP
             WHERE id = $12
             RETURNING *`,
            [
                title || null,
                description || null,
                category_id || null,
                location || null,
                salary_min || null,
                salary_max || null,
                job_type || null,
                experience_level || null,
                required_skills ? JSON.stringify(required_skills) : null,
                status || null,
                expiresAtValue,
                id,
            ]
        );

        res.json({ message: 'Job updated successfully.', job: result.rows[0] });
    } catch (err) {
        console.error('updateJob error:', err);
        res.status(500).json({ message: 'Server error while updating job.' });
    }
};

// ─── TOGGLE JOB STATUS ────────────────────────────────────────
const toggleJobStatus = async (req, res) => {
    const { id } = req.params;
    const employer_id = req.user.id;

    try {
        const existing = await db.query('SELECT * FROM jobs WHERE id = $1', [id]);

        if (existing.rows.length === 0) {
            return res.status(404).json({ message: 'Job not found.' });
        }

        if (existing.rows[0].employer_id !== employer_id) {
            return res.status(403).json({ message: 'You can only modify your own job listings.' });
        }

        const newStatus = existing.rows[0].status === 'active' ? 'closed' : 'active';

        const result = await db.query(
            `UPDATE jobs SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
            [newStatus, id]
        );

        res.json({
            message: `Job is now ${newStatus}.`,
            job: result.rows[0],
        });
    } catch (err) {
        console.error('toggleJobStatus error:', err);
        res.status(500).json({ message: 'Server error while toggling job status.' });
    }
};

// ─── DELETE JOB ──────────────────────────────────────────────
const deleteJob = async (req, res) => {
    const { id } = req.params;
    const employer_id = req.user.id;

    try {
        const existing = await db.query('SELECT * FROM jobs WHERE id = $1', [id]);

        if (existing.rows.length === 0) {
            return res.status(404).json({ message: 'Job not found.' });
        }

        if (existing.rows[0].employer_id !== employer_id) {
            return res.status(403).json({ message: 'You can only delete your own job listings.' });
        }

        await db.query('DELETE FROM jobs WHERE id = $1', [id]);

        res.json({ message: 'Job deleted successfully.' });
    } catch (err) {
        console.error('deleteJob error:', err);
        res.status(500).json({ message: 'Server error while deleting job.' });
    }
};

// ─── GET ALL CATEGORIES ──────────────────────────────────────
const getCategories = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM job_categories ORDER BY name ASC');
        res.json({ categories: result.rows });
    } catch (err) {
        console.error('getCategories error:', err);
        res.status(500).json({ message: 'Server error while fetching categories.' });
    }
};
// ============================================
// SEARCH & FILTER JOBS
// ============================================
const searchJobs = async (req, res) => {
    try {
        const { 
            keyword,           // Search in title and description
            category,          // Filter by category ID
            location,          // Filter by location
            job_type,          // full-time, part-time, contract, freelance
            experience_level,  // entry, mid, senior, any
            salary_min,        // Minimum salary
            salary_max,        // Maximum salary
            sort_by = 'date',  // date, salary_asc, salary_desc, relevance
            page = 1,
            limit = 10
        } = req.query;

        // Build the WHERE clause dynamically
        let whereConditions = ['j.status = $1', '(j.expires_at IS NULL OR j.expires_at > NOW())'];
        let queryParams = ['active'];
        let paramCount = 2;

        // Full-text search on title and description
        if (keyword) {
            whereConditions.push(`(j.title ILIKE $${paramCount} OR j.description ILIKE $${paramCount})`);
            queryParams.push(`%${keyword}%`);
            paramCount++;
        }

        // Filter by category
        if (category) {
            whereConditions.push(`j.category_id = $${paramCount}`);
            queryParams.push(category);
            paramCount++;
        }

        // Filter by location (partial match)
        if (location) {
            whereConditions.push(`j.location ILIKE $${paramCount}`);
            queryParams.push(`%${location}%`);
            paramCount++;
        }

        // Filter by job type
        if (job_type) {
            whereConditions.push(`j.job_type = $${paramCount}`);
            queryParams.push(job_type);
            paramCount++;
        }

        // Filter by experience level
        if (experience_level) {
            whereConditions.push(`j.experience_level = $${paramCount}`);
            queryParams.push(experience_level);
            paramCount++;
        }

        // Salary range filter
        if (salary_min) {
            whereConditions.push(`j.salary_max >= $${paramCount}`);
            queryParams.push(salary_min);
            paramCount++;
        }

        if (salary_max) {
            whereConditions.push(`j.salary_min <= $${paramCount}`);
            queryParams.push(salary_max);
            paramCount++;
        }

        // Build ORDER BY clause
        let orderBy = 'j.created_at DESC'; // Default: newest first
        
        if (sort_by === 'salary_asc') {
            orderBy = 'j.salary_min ASC NULLS LAST';
        } else if (sort_by === 'salary_desc') {
            orderBy = 'j.salary_max DESC NULLS LAST';
        } else if (sort_by === 'relevance' && keyword) {
            // Relevance: prioritize exact matches in title
            orderBy = `
                CASE 
                    WHEN j.title ILIKE $${paramCount} THEN 1
                    WHEN j.title ILIKE $${paramCount + 1} THEN 2
                    ELSE 3
                END,
                j.created_at DESC
            `;
            queryParams.push(keyword); // Exact match
            queryParams.push(`%${keyword}%`); // Partial match
            paramCount += 2;
        }

        // Pagination
        const parsedLimit = parseInt(limit) || 10;
        const parsedPage = parseInt(page) || 1;
        const offset = (parsedPage - 1) * parsedLimit;
        queryParams.push(parsedLimit, offset);

        // Main query
        const query = `
            SELECT 
                j.*,
                u.name as employer_name,
                c.name as category_name,
                (SELECT COUNT(*) FROM applications WHERE job_id = j.id) as application_count
            FROM jobs j
            LEFT JOIN users u ON j.employer_id = u.id
            LEFT JOIN job_categories c ON j.category_id = c.id
            WHERE ${whereConditions.length > 0 ? whereConditions.join(' AND ') : '1=1'}
            ORDER BY ${orderBy}
            LIMIT $${queryParams.length - 1} OFFSET $${queryParams.length}
        `;

        const result = await db.query(query, queryParams);

        // Get total count for pagination
        const countQuery = `
            SELECT COUNT(*) 
            FROM jobs j 
            WHERE ${whereConditions.join(' AND ')}
        `;
        const countResult = await db.query(countQuery, queryParams.slice(0, -2));
        const totalJobs = parseInt(countResult.rows[0].count);

        res.json({
            success: true,
            jobs: result.rows,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: totalJobs,
                totalPages: Math.ceil(totalJobs / limit),
                hasMore: page * limit < totalJobs
            },
            filters: {
                keyword,
                category,
                location,
                job_type,
                experience_level,
                salary_min,
                salary_max,
                sort_by
            }
        });

    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ 
            success: false,
            error: 'Server error during search' 
        });
    }
};

// ============================================
// GET FILTER OPTIONS (for frontend dropdowns)
// ============================================
const getFilterOptions = async (req, res) => {
    try {
        // Get all categories
        const categories = await db.query(
            'SELECT id, name FROM job_categories ORDER BY name'
        );

        // Get unique locations
        const locations = await db.query(`
            SELECT DISTINCT location 
            FROM jobs 
            WHERE location IS NOT NULL AND status = 'active'
            ORDER BY location
        `);

        res.json({
            success: true,
            filters: {
                categories: categories.rows,
                locations: locations.rows.map(row => row.location),
                jobTypes: ['full-time', 'part-time', 'contract', 'freelance'],
                experienceLevels: ['entry', 'mid', 'senior', 'any']
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            success: false,
            error: 'Server error' 
        });
    }
};
module.exports = {
    createJob,
    getAllJobs,
    getMyJobs,
    getJobById,
    updateJob,
    toggleJobStatus,
    deleteJob,
    getCategories,
    searchJobs,
    getFilterOptions,
};