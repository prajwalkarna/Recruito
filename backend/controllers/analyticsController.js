const db = require('../db');

// ============================================
// EMPLOYER ANALYTICS
// ============================================

// Get employer dashboard stats
exports.getEmployerStats = async (req, res) => {
    try {
        const employerId = req.user.id;

        // Total jobs stats
        const jobStats = await db.query(
            `SELECT 
                COUNT(*) as total_jobs,
                COUNT(*) FILTER (WHERE status = 'active') as active_jobs,
                COUNT(*) FILTER (WHERE status = 'closed') as closed_jobs,
                SUM(views_count) as total_views
             FROM jobs 
             WHERE employer_id = $1`,
            [employerId]
        );

        // Total applications
        const applicationStats = await db.query(
            `SELECT 
                COUNT(*) as total_applications,
                COUNT(*) FILTER (WHERE a.status = 'pending') as pending,
                COUNT(*) FILTER (WHERE a.status = 'accepted') as accepted,
                COUNT(*) FILTER (WHERE a.status = 'rejected') as rejected,
                COUNT(*) FILTER (WHERE a.status = 'shortlisted') as shortlisted
             FROM applications a
             JOIN jobs j ON a.job_id = j.id
             WHERE j.employer_id = $1`,
            [employerId]
        );

        // Applications this month
        const monthlyApps = await db.query(
            `SELECT COUNT(*) as count
             FROM applications a
             JOIN jobs j ON a.job_id = j.id
             WHERE j.employer_id = $1 
             AND a.applied_at >= DATE_TRUNC('month', CURRENT_DATE)`,
            [employerId]
        );

        res.json({
            success: true,
            stats: {
                jobs: jobStats.rows[0],
                applications: applicationStats.rows[0],
                monthly_applications: parseInt(monthlyApps.rows[0].count)
            }
        });
    } catch (error) {
        console.error('Get employer stats error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
};

// Get applications over time (for line chart)
exports.getApplicationsOverTime = async (req, res) => {
    try {
        const employerId = req.user.id;
        const { days = 30 } = req.query;

        const result = await db.query(
            `SELECT 
                DATE(a.applied_at) as date,
                COUNT(*) as count
             FROM applications a
             JOIN jobs j ON a.job_id = j.id
             WHERE j.employer_id = $1 
             AND a.applied_at >= CURRENT_DATE - ($2 || ' days')::INTERVAL
             GROUP BY DATE(a.applied_at)
             ORDER BY date ASC`,
            [employerId, parseInt(days) || 30]
        );

        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Get applications over time error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
};

// Get top performing jobs
exports.getTopJobs = async (req, res) => {
    try {
        const employerId = req.user.id;

        const result = await db.query(
            `SELECT 
                j.id,
                j.title,
                j.status,
                COUNT(a.id) as application_count,
                j.views_count
             FROM jobs j
             LEFT JOIN applications a ON j.id = a.job_id
             WHERE j.employer_id = $1
             GROUP BY j.id
             ORDER BY application_count DESC
             LIMIT 5`,
            [employerId]
        );

        res.json({
            success: true,
            jobs: result.rows
        });
    } catch (error) {
        console.error('Get top jobs error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
};

// Get application status distribution
exports.getApplicationStatusDistribution = async (req, res) => {
    try {
        const employerId = req.user.id;

        const result = await db.query(
            `SELECT 
                a.status,
                COUNT(*) as count
             FROM applications a
             JOIN jobs j ON a.job_id = j.id
             WHERE j.employer_id = $1
             GROUP BY a.status`,
            [employerId]
        );

        res.json({
            success: true,
            distribution: result.rows
        });
    } catch (error) {
        console.error('Get status distribution error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
};

// Get recent activity
exports.getRecentActivity = async (req, res) => {
    try {
        const employerId = req.user.id;

        const result = await db.query(
            `SELECT 
                a.id,
                a.status,
                a.applied_at,
                a.updated_at,
                j.title as job_title,
                u.name as applicant_name
             FROM applications a
             JOIN jobs j ON a.job_id = j.id
             JOIN users u ON a.freelancer_id = u.id
             WHERE j.employer_id = $1
             ORDER BY a.applied_at DESC
             LIMIT 10`,
            [employerId]
        );

        res.json({
            success: true,
            activities: result.rows
        });
    } catch (error) {
        console.error('Get recent activity error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
};

// ============================================
// FREELANCER ANALYTICS
// ============================================

// Get freelancer dashboard stats
exports.getFreelancerStats = async (req, res) => {
    try {
        const freelancerId = req.user.id;

        // Application stats
        const appStats = await db.query(
            `SELECT 
                COUNT(*) as total_applications,
                COUNT(*) FILTER (WHERE status = 'pending') as pending,
                COUNT(*) FILTER (WHERE status = 'accepted') as accepted,
                COUNT(*) FILTER (WHERE status = 'rejected') as rejected,
                COUNT(*) FILTER (WHERE status = 'shortlisted') as shortlisted
             FROM applications 
             WHERE freelancer_id = $1`,
            [freelancerId]
        );

        // Success rate
        const stats = appStats.rows[0];
        const successRate = stats.total_applications > 0
            ? ((parseInt(stats.accepted) / parseInt(stats.total_applications)) * 100).toFixed(1)
            : 0;

        // Applications this month
        const monthlyApps = await db.query(
            `SELECT COUNT(*) as count
             FROM applications 
             WHERE freelancer_id = $1 
             AND applied_at >= DATE_TRUNC('month', CURRENT_DATE)`,
            [freelancerId]
        );

        // Average response time
        const avgResponse = await db.query(
            `SELECT 
                AVG(EXTRACT(EPOCH FROM (updated_at - applied_at))/86400) as avg_days
             FROM applications 
             WHERE freelancer_id = $1 
             AND status != 'pending'`,
            [freelancerId]
        );

        res.json({
            success: true,
            stats: {
                applications: appStats.rows[0],
                success_rate: parseFloat(successRate),
                monthly_applications: parseInt(monthlyApps.rows[0].count),
                avg_response_days: avgResponse.rows[0].avg_days
                    ? parseFloat(avgResponse.rows[0].avg_days).toFixed(1)
                    : null
            }
        });
    } catch (error) {
        console.error('Get freelancer stats error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
};

// Get freelancer applications over time
exports.getFreelancerApplicationsOverTime = async (req, res) => {
    try {
        const freelancerId = req.user.id;
        const { days = 30 } = req.query;

        const result = await db.query(
            `SELECT 
                DATE(applied_at) as date,
                COUNT(*) as count
             FROM applications
             WHERE freelancer_id = $1 
             AND applied_at >= CURRENT_DATE - ($2 || ' days')::INTERVAL
             GROUP BY DATE(applied_at)
             ORDER BY date ASC`,
            [freelancerId, parseInt(days) || 30]
        );

        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Get freelancer applications over time error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
};

// Get freelancer application status distribution
exports.getFreelancerStatusDistribution = async (req, res) => {
    try {
        const freelancerId = req.user.id;

        const result = await db.query(
            `SELECT 
                status,
                COUNT(*) as count
             FROM applications
             WHERE freelancer_id = $1
             GROUP BY status`,
            [freelancerId]
        );

        res.json({
            success: true,
            distribution: result.rows
        });
    } catch (error) {
        console.error('Get freelancer status distribution error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
};

// Get freelancer recent activity
exports.getFreelancerRecentActivity = async (req, res) => {
    try {
        const freelancerId = req.user.id;

        const result = await db.query(
            `SELECT 
                a.id,
                a.status,
                a.applied_at,
                a.updated_at,
                j.title as job_title,
                u.name as employer_name
             FROM applications a
             JOIN jobs j ON a.job_id = j.id
             JOIN users u ON j.employer_id = u.id
             WHERE a.freelancer_id = $1
             ORDER BY a.applied_at DESC
             LIMIT 10`,
            [freelancerId]
        );

        res.json({
            success: true,
            activities: result.rows
        });
    } catch (error) {
        console.error('Get freelancer recent activity error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
};