const db = require('../db');
const { sendApplicationReceivedEmail, sendStatusChangeEmail } = require('../services/emailService');
const { notifyApplicationReceived, notifyStatusChange } = require('../services/notificationService');

// ─── APPLY TO JOB ─────────────────────────────────────────────
const applyToJob = async (req, res) => {
    const freelancer_id = req.user.id;
    const { job_id, cv_id, cover_letter } = req.body;

    if (!job_id || !cv_id) {
        return res.status(400).json({ message: 'job_id and cv_id are required.' });
    }

    try {
        // Check job exists and is active
        const jobCheck = await db.query(
            'SELECT id, status, employer_id FROM jobs WHERE id = $1',
            [job_id]
        );

        if (jobCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Job not found.' });
        }

        if (jobCheck.rows[0].status !== 'active') {
            return res.status(400).json({ message: 'This job is no longer accepting applications.' });
        }

        // Employer cannot apply to their own job
        if (jobCheck.rows[0].employer_id === freelancer_id) {
            return res.status(400).json({ message: 'You cannot apply to your own job listing.' });
        }

        // Check CV belongs to this user
        const cvCheck = await db.query(
            'SELECT id FROM cvs WHERE id = $1 AND user_id = $2',
            [cv_id, freelancer_id]
        );

        if (cvCheck.rows.length === 0) {
            return res.status(404).json({ message: 'CV not found or does not belong to you.' });
        }

        // Insert — UNIQUE(job_id, freelancer_id) constraint will catch duplicates
        const result = await db.query(
            `INSERT INTO applications (job_id, freelancer_id, cv_id, cover_letter)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [job_id, freelancer_id, cv_id, cover_letter || null]
        );

        // 🆕 Send email notification to employer
        sendApplicationReceivedEmail(result.rows[0].id);

        // 🆕 Send in-app notification
        const io = req.app.get('io');
        notifyApplicationReceived(result.rows[0].id, io);

        res.status(201).json({
            success: true,
            message: 'Application submitted successfully',
            application: result.rows[0],
        });
    } catch (err) {
        // Unique violation = already applied
        if (err.code === '23505') {
            return res.status(409).json({ message: 'You have already applied to this job.' });
        }
        console.error('applyToJob error:', err);
        res.status(500).json({ message: 'Server error while submitting application.' });
    }
};

// ─── GET MY APPLICATIONS (freelancer) ─────────────────────────
const getMyApplications = async (req, res) => {
    const freelancer_id = req.user.id;

    try {
        const result = await db.query(
            `SELECT 
                a.*,
                j.title        AS job_title,
                j.location     AS job_location,
                j.job_type,
                j.salary_min,
                j.salary_max,
                j.status       AS job_status,
                u.name         AS employer_name,
                u.profile_picture AS employer_picture,
                jc.name        AS category_name,
                c.title        AS cv_title
             FROM applications a
             JOIN jobs j ON a.job_id = j.id
             JOIN users u ON j.employer_id = u.id
             LEFT JOIN job_categories jc ON j.category_id = jc.id
             LEFT JOIN cvs c ON a.cv_id = c.id
             WHERE a.freelancer_id = $1
             ORDER BY a.applied_at DESC`,
            [freelancer_id]
        );

        res.json({ applications: result.rows });
    } catch (err) {
        console.error('getMyApplications error:', err);
        res.status(500).json({ message: 'Server error while fetching applications.' });
    }
};

// ─── GET SINGLE APPLICATION ───────────────────────────────────
const getApplicationById = async (req, res) => {
    const { id } = req.params;
    const user_id = req.user.id;

    try {
        const result = await db.query(
            `SELECT a.*, j.title AS job_title, j.employer_id, u.name AS employer_name
             FROM applications a
             JOIN jobs j ON a.job_id = j.id
             JOIN users u ON j.employer_id = u.id
             WHERE a.id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Application not found.' });
        }

        const app = result.rows[0];

        // Only the freelancer or the employer of that job can view
        if (app.freelancer_id !== user_id && app.employer_id !== user_id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied.' });
        }

        res.json({ application: app });
    } catch (err) {
        console.error('getApplicationById error:', err);
        res.status(500).json({ message: 'Server error while fetching application.' });
    }
};

// ─── WITHDRAW APPLICATION ─────────────────────────────────────
const withdrawApplication = async (req, res) => {
    const { id } = req.params;
    const freelancer_id = req.user.id;

    try {
        const existing = await db.query('SELECT * FROM applications WHERE id = $1', [id]);

        if (existing.rows.length === 0) {
            return res.status(404).json({ message: 'Application not found.' });
        }

        if (existing.rows[0].freelancer_id !== freelancer_id) {
            return res.status(403).json({ message: 'You can only withdraw your own applications.' });
        }

        if (['accepted', 'rejected'].includes(existing.rows[0].status)) {
            return res.status(400).json({ message: `Cannot withdraw an application that has been ${existing.rows[0].status}.` });
        }

        const result = await db.query(
            `UPDATE applications 
             SET status = 'withdrawn', updated_at = CURRENT_TIMESTAMP 
             WHERE id = $1 
             RETURNING *`,
            [id]
        );

        res.json({ message: 'Application withdrawn.', application: result.rows[0] });
    } catch (err) {
        console.error('withdrawApplication error:', err);
        res.status(500).json({ message: 'Server error while withdrawing application.' });
    }
};

// ─── CHECK IF ALREADY APPLIED ─────────────────────────────────
const checkAlreadyApplied = async (req, res) => {
    const { jobId } = req.params;
    const freelancer_id = req.user.id;

    try {
        const result = await db.query(
            'SELECT id, status FROM applications WHERE job_id = $1 AND freelancer_id = $2',
            [jobId, freelancer_id]
        );

        res.json({
            applied: result.rows.length > 0,
            application: result.rows[0] || null,
        });
    } catch (err) {
        console.error('checkAlreadyApplied error:', err);
        res.status(500).json({ message: 'Server error.' });
    }
};

// ============================================
// GET APPLICANTS FOR A JOB (Employer)
// ============================================
const getJobApplicants = async (req, res) => {
    try {
        const { jobId } = req.params;
        const employerId = req.user.id;
        const { status, skills, sort_by = 'date' } = req.query;

        // Verify job belongs to this employer
        const jobCheck = await db.query(
            'SELECT id, employer_id FROM jobs WHERE id = $1',
            [jobId]
        );

        if (jobCheck.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Job not found'
            });
        }

        if (jobCheck.rows[0].employer_id !== employerId) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to view applicants for this job'
            });
        }

        // Build query
        let query = `
            SELECT 
                a.*,
                u.name as applicant_name,
                u.email as applicant_email,
                u.phone as applicant_phone,
                u.profile_picture,
                c.title as cv_title,
                c.skills,
                c.experience,
                c.education
            FROM applications a
            JOIN users u ON a.freelancer_id = u.id
            LEFT JOIN cvs c ON a.cv_id = c.id
            WHERE a.job_id = $1
        `;

        const params = [jobId];
        let paramCount = 2;

        // Filter by status
        if (status) {
            query += ` AND a.status = $${paramCount}`;
            params.push(status);
            paramCount++;
        }

        // Filter by skills (if CV has matching skills)
        if (skills) {
            query += ` AND c.skills::text ILIKE $${paramCount}`;
            params.push(`%${skills}%`);
            paramCount++;
        }

        // Sort
        if (sort_by === 'date') {
            query += ' ORDER BY a.applied_at DESC';
        } else if (sort_by === 'name') {
            query += ' ORDER BY u.name ASC';
        } else if (sort_by === 'status') {
            query += ' ORDER BY a.status ASC, a.applied_at DESC';
        }

        const result = await db.query(query, params);

        res.json({
            success: true,
            applicants: result.rows,
            total: result.rows.length
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
};

// ============================================
// UPDATE APPLICATION STATUS (Employer)
// ============================================
const updateApplicationStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const employerId = req.user.id;
        const { status } = req.body;

        // Validate status
        const validStatuses = ['pending', 'accepted', 'rejected', 'shortlisted'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid status'
            });
        }

        // Verify this application belongs to employer's job
        const appCheck = await db.query(
            `SELECT a.id, j.employer_id 
             FROM applications a
             JOIN jobs j ON a.job_id = j.id
             WHERE a.id = $1`,
            [id]
        );

        if (appCheck.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Application not found'
            });
        }

        if (appCheck.rows[0].employer_id !== employerId) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to update this application'
            });
        }

        // Update status
        const result = await db.query(
            `UPDATE applications 
             SET status = $1, updated_at = NOW() 
             WHERE id = $2 
             RETURNING *`,
            [status, id]
        );

        // 🆕 Send email notification to freelancer
        sendStatusChangeEmail(id, status);

        // 🆕 Send in-app notification
        const io = req.app.get('io');
        notifyStatusChange(id, status, io);

        res.json({
            success: true,
            message: `Application ${status}`,
            application: result.rows[0]
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
};

// ============================================
// BULK UPDATE APPLICATION STATUS
// ============================================
const bulkUpdateStatus = async (req, res) => {
    try {
        const employerId = req.user.id;
        const { applicationIds, status } = req.body;

        // Validate
        if (!applicationIds || !Array.isArray(applicationIds) || applicationIds.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Application IDs required'
            });
        }

        const validStatuses = ['pending', 'accepted', 'rejected', 'shortlisted'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid status'
            });
        }

        // Verify all applications belong to employer's jobs
        const verification = await db.query(
            `SELECT a.id 
             FROM applications a
             JOIN jobs j ON a.job_id = j.id
             WHERE a.id = ANY($1) AND j.employer_id = $2`,
            [applicationIds, employerId]
        );

        if (verification.rows.length !== applicationIds.length) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to update some applications'
            });
        }

        // Bulk update
        await db.query(
            `UPDATE applications 
             SET status = $1, updated_at = NOW() 
             WHERE id = ANY($2)`,
            [status, applicationIds]
        );

        // 🆕 Send email notifications to all freelancers
        const io = req.app.get('io');
        applicationIds.forEach(id => {
            sendStatusChangeEmail(id, status);
            notifyStatusChange(id, status, io);
        });

        res.json({
            success: true,
            message: `${applicationIds.length} applications updated to ${status}`,
            updated: applicationIds.length
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
};

// ============================================
// GET APPLICANT DETAILS (with CV)
// ============================================
const getApplicantDetails = async (req, res) => {
    try {
        const { applicationId } = req.params;
        const employerId = req.user.id;

        // Get application with full details
        const result = await db.query(
            `SELECT 
                a.*,
                u.id as user_id,
                u.name,
                u.email,
                u.phone,
                u.bio,
                u.profile_picture,
                u.created_at as member_since,
                c.title as cv_title,
                c.full_name,
                c.summary,
                c.skills,
                c.experience,
                c.education,
                c.certifications,
                c.languages,
                j.title as job_title,
                j.employer_id
            FROM applications a
            JOIN users u ON a.freelancer_id = u.id
            LEFT JOIN cvs c ON a.cv_id = c.id
            JOIN jobs j ON a.job_id = j.id
            WHERE a.id = $1`,
            [applicationId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Application not found'
            });
        }

        const application = result.rows[0];

        // Verify employer owns this job
        if (application.employer_id !== employerId) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to view this application'
            });
        }

        res.json({
            success: true,
            application: {
                id: application.id,
                status: application.status,
                cover_letter: application.cover_letter,
                applied_at: application.applied_at,
                applicant: {
                    id: application.user_id,
                    name: application.name,
                    email: application.email,
                    phone: application.phone,
                    bio: application.bio,
                    profile_picture: application.profile_picture,
                    member_since: application.member_since
                },
                cv: {
                    title: application.cv_title,
                    full_name: application.full_name,
                    summary: application.summary,
                    skills: application.skills,
                    experience: application.experience,
                    education: application.education,
                    certifications: application.certifications,
                    languages: application.languages
                },
                job_title: application.job_title
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
    applyToJob,
    getMyApplications,
    getApplicationById,
    withdrawApplication,
    checkAlreadyApplied,
    getJobApplicants,
    updateApplicationStatus,
    bulkUpdateStatus,
    getApplicantDetails
};
