const db = require('../db');

// EMPLOYER DASHBOARD STATS
// ============================================
const getEmployerDashboard = async (req, res) => {
    try {
        const employerId = req.user.id;

        // 1. Total Jobs Posted
        const totalJobsResult = await db.query(
            'SELECT COUNT(*) as count FROM jobs WHERE employer_id = $1',
            [employerId]
        );
        const totalJobs = parseInt(totalJobsResult.rows[0].count);

        // 2. Active Jobs
        const activeJobsResult = await db.query(
            'SELECT COUNT(*) as count FROM jobs WHERE employer_id = $1 AND status = $2',
            [employerId, 'active']
        );
        const activeJobs = parseInt(activeJobsResult.rows[0].count);

        // 3. Total Applications Received
        const totalApplicationsResult = await db.query(
            `SELECT COUNT(*) as count 
             FROM applications a
             JOIN jobs j ON a.job_id = j.id
             WHERE j.employer_id = $1`,
            [employerId]
        );
        const totalApplications = parseInt(totalApplicationsResult.rows[0].count);

        // 4. Pending Applications
        const pendingApplicationsResult = await db.query(
            `SELECT COUNT(*) as count 
             FROM applications a
             JOIN jobs j ON a.job_id = j.id
             WHERE j.employer_id = $1 AND a.status = $2`,
            [employerId, 'pending']
        );
        const pendingApplications = parseInt(pendingApplicationsResult.rows[0].count);

        // 5. Accepted Applications
        const acceptedApplicationsResult = await db.query(
            `SELECT COUNT(*) as count 
             FROM applications a
             JOIN jobs j ON a.job_id = j.id
             WHERE j.employer_id = $1 AND a.status = $2`,
            [employerId, 'accepted']
        );
        const acceptedApplications = parseInt(acceptedApplicationsResult.rows[0].count);

        // 6. Recent Applications (last 7 days)
        const recentApplicationsResult = await db.query(
            `SELECT COUNT(*) as count 
             FROM applications a
             JOIN jobs j ON a.job_id = j.id
             WHERE j.employer_id = $1 
             AND a.applied_at >= NOW() - INTERVAL '7 days'`,
            [employerId]
        );
        const recentApplications = parseInt(recentApplicationsResult.rows[0].count);

        // 7. Top 5 Jobs by Application Count
        const topJobsResult = await db.query(
            `SELECT 
                j.id,
                j.title,
                j.location,
                j.job_type,
                j.created_at,
                COUNT(a.id) as application_count
             FROM jobs j
             LEFT JOIN applications a ON j.id = a.job_id
             WHERE j.employer_id = $1
             GROUP BY j.id
             ORDER BY application_count DESC
             LIMIT 5`,
            [employerId]
        );

        // 8. Recent Applicants (last 10)
        const recentApplicantsResult = await db.query(
            `SELECT 
                a.id as application_id,
                a.status,
                a.applied_at,
                u.id as applicant_id,
                u.name as applicant_name,
                u.email as applicant_email,
                u.profile_picture,
                j.id as job_id,
                j.title as job_title
             FROM applications a
             JOIN users u ON a.freelancer_id = u.id
             JOIN jobs j ON a.job_id = j.id
             WHERE j.employer_id = $1
             ORDER BY a.applied_at DESC
             LIMIT 10`,
            [employerId]
        );

        // 9. Applications by Status (for pie chart)
        const applicationsByStatusResult = await db.query(
            `SELECT 
                a.status,
                COUNT(*) as count
             FROM applications a
             JOIN jobs j ON a.job_id = j.id
             WHERE j.employer_id = $1
             GROUP BY a.status`,
            [employerId]
        );

        const applicationsByStatus = {
            pending: 0,
            shortlisted: 0,
            accepted: 0,
            rejected: 0
        };

        applicationsByStatusResult.rows.forEach(row => {
            applicationsByStatus[row.status] = parseInt(row.count);
        });

        // 10. Jobs by Status
        const jobsByStatusResult = await db.query(
            `SELECT 
                status,
                COUNT(*) as count
             FROM jobs
             WHERE employer_id = $1
             GROUP BY status`,
            [employerId]
        );

        const jobsByStatus = {
            active: 0,
            closed: 0,
            draft: 0
        };

        jobsByStatusResult.rows.forEach(row => {
            jobsByStatus[row.status] = parseInt(row.count);
        });

        // Send response
        res.json({
            success: true,
            stats: {
                totalJobs,
                activeJobs,
                totalApplications,
                pendingApplications,
                acceptedApplications,
                recentApplications
            },
            topJobs: topJobsResult.rows,
            recentApplicants: recentApplicantsResult.rows,
            applicationsByStatus,
            jobsByStatus
        });

    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ 
            success: false,
            error: 'Server error' 
        });
    }
};

// FREELANCER DASHBOARD STATS (Bonus for Pranjal)
// ============================================
const getFreelancerDashboard = async (req, res) => {
    try {
        const freelancerId = req.user.id;

        // 1. Total Applications
        const totalApplicationsResult = await db.query(
            'SELECT COUNT(*) as count FROM applications WHERE freelancer_id = $1',
            [freelancerId]
        );
        const totalApplications = parseInt(totalApplicationsResult.rows[0].count);

        // 2. Pending Applications
        const pendingApplicationsResult = await db.query(
            'SELECT COUNT(*) as count FROM applications WHERE freelancer_id = $1 AND status = $2',
            [freelancerId, 'pending']
        );
        const pendingApplications = parseInt(pendingApplicationsResult.rows[0].count);

        // 3. Accepted Applications
        const acceptedApplicationsResult = await db.query(
            'SELECT COUNT(*) as count FROM applications WHERE freelancer_id = $1 AND status = $2',
            [freelancerId, 'accepted']
        );
        const acceptedApplications = parseInt(acceptedApplicationsResult.rows[0].count);

        // 4. Rejected Applications
        const rejectedApplicationsResult = await db.query(
            'SELECT COUNT(*) as count FROM applications WHERE freelancer_id = $1 AND status = $2',
            [freelancerId, 'rejected']
        );
        const rejectedApplications = parseInt(rejectedApplicationsResult.rows[0].count);

        // 5. Total CVs
        const totalCVsResult = await db.query(
            'SELECT COUNT(*) as count FROM cvs WHERE user_id = $1',
            [freelancerId]
        );
        const totalCVs = parseInt(totalCVsResult.rows[0].count);

        // 6. Recent Applications (last 10)
        const recentApplicationsResult = await db.query(
            `SELECT 
                a.id,
                a.status,
                a.applied_at,
                j.id as job_id,
                j.title,
                j.location,
                j.job_type,
                u.name as employer_name
             FROM applications a
             JOIN jobs j ON a.job_id = j.id
             JOIN users u ON j.employer_id = u.id
             WHERE a.freelancer_id = $1
             ORDER BY a.applied_at DESC
             LIMIT 10`,
            [freelancerId]
        );

        // 7. Profile Completion Score
        const userResult = await db.query(
            'SELECT name, email, phone, bio, profile_picture FROM users WHERE id = $1',
            [freelancerId]
        );
        
        let profileCompletion = 0;
        const user = userResult.rows[0];
        if (user.name) profileCompletion += 20;
        if (user.email) profileCompletion += 20;
        if (user.phone) profileCompletion += 20;
        if (user.bio) profileCompletion += 20;
        if (user.profile_picture) profileCompletion += 20;

        // 8. Applications by Status
        const applicationsByStatus = {
            pending: pendingApplications,
            accepted: acceptedApplications,
            rejected: rejectedApplications,
            shortlisted: totalApplications - (pendingApplications + acceptedApplications + rejectedApplications)
        };

        res.json({
            success: true,
            stats: {
                totalApplications,
                pendingApplications,
                acceptedApplications,
                rejectedApplications,
                totalCVs,
                profileCompletion
            },
            recentApplications: recentApplicationsResult.rows,
            applicationsByStatus
        });

    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ 
            success: false,
            error: 'Server error' 
        });
    }
};

module.exports = { 
    getEmployerDashboard,
    getFreelancerDashboard 
};