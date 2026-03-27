const db = require('../db');
const { AppError, asyncHandler } = require('../middleware/errorHandler');

// ============================================
// MIDDLEWARE - CHECK ADMIN
// ============================================
const checkAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return next(new AppError('Access denied. Admin only.', 403));
    }
    next();
};

// ============================================
// GET ALL USERS (Admin)
// ============================================
const getAllUsers = asyncHandler(async (req, res, next) => {
    const { role, status, search, page = 1, limit = 20 } = req.query;
    
    let query = `
        SELECT 
            u.id,
            u.name,
            u.email,
            u.role,
            u.phone,
            u.is_active,
            u.profile_picture,
            u.created_at,
            u.updated_at,
            COUNT(DISTINCT CASE WHEN u.role = 'employer' THEN j.id END) as jobs_posted,
            COUNT(DISTINCT CASE WHEN u.role = 'freelancer' THEN a.id END) as applications_submitted,
            COUNT(DISTINCT CASE WHEN u.role = 'freelancer' THEN cv.id END) as cvs_created
        FROM users u
        LEFT JOIN jobs j ON u.id = j.employer_id AND u.role = 'employer'
        LEFT JOIN applications a ON u.id = a.freelancer_id AND u.role = 'freelancer'
        LEFT JOIN cvs cv ON u.id = cv.user_id AND u.role = 'freelancer'
        WHERE 1=1
    `;
    
    const params = [];
    let paramIndex = 1;

    // Filter by role
    if (role && ['freelancer', 'employer', 'admin'].includes(role)) {
        query += ` AND u.role = $${paramIndex}`;
        params.push(role);
        paramIndex++;
    }

    // Filter by status
    if (status === 'active') {
        query += ` AND u.is_active = true`;
    } else if (status === 'inactive') {
        query += ` AND u.is_active = false`;
    }

    // Search by name or email
    if (search) {
        query += ` AND (LOWER(u.name) LIKE $${paramIndex} OR LOWER(u.email) LIKE $${paramIndex})`;
        params.push(`%${search.toLowerCase()}%`);
        paramIndex++;
    }

    query += ` GROUP BY u.id ORDER BY u.created_at DESC`;

    // Pagination
    const offset = (page - 1) * limit;
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await db.query(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM users WHERE 1=1';
    const countParams = [];
    let countParamIndex = 1;

    if (role && ['freelancer', 'employer', 'admin'].includes(role)) {
        countQuery += ` AND role = $${countParamIndex}`;
        countParams.push(role);
        countParamIndex++;
    }

    if (status === 'active') {
        countQuery += ` AND is_active = true`;
    } else if (status === 'inactive') {
        countQuery += ` AND is_active = false`;
    }

    if (search) {
        countQuery += ` AND (LOWER(name) LIKE $${countParamIndex} OR LOWER(email) LIKE $${countParamIndex})`;
        countParams.push(`%${search.toLowerCase()}%`);
    }

    const countResult = await db.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].total);

    res.json({
        success: true,
        users: result.rows,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
        }
    });
});

// ============================================
// GET USER BY ID (Admin)
// ============================================
const getUserById = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const userResult = await db.query(
        `SELECT 
            id, name, email, role, phone, bio, 
            profile_picture, is_active, created_at, updated_at
         FROM users 
         WHERE id = $1`,
        [id]
    );

    if (userResult.rows.length === 0) {
        return next(new AppError('User not found', 404));
    }

    const user = userResult.rows[0];

    // Get additional stats based on role
    let additionalData = {};

    if (user.role === 'employer') {
        const jobsResult = await db.query(
            `SELECT 
                COUNT(*) as total_jobs,
                COUNT(*) FILTER (WHERE status = 'active') as active_jobs,
                COUNT(*) FILTER (WHERE status = 'closed') as closed_jobs
             FROM jobs 
             WHERE employer_id = $1`,
            [id]
        );

        const applicationsResult = await db.query(
            `SELECT COUNT(*) as total_applications
             FROM applications a
             JOIN jobs j ON a.job_id = j.id
             WHERE j.employer_id = $1`,
            [id]
        );

        additionalData = {
            jobs: jobsResult.rows[0],
            applications_received: parseInt(applicationsResult.rows[0].total_applications)
        };
    } else if (user.role === 'freelancer') {
        const applicationsResult = await db.query(
            `SELECT 
                COUNT(*) as total_applications,
                COUNT(*) FILTER (WHERE status = 'pending') as pending,
                COUNT(*) FILTER (WHERE status = 'accepted') as accepted,
                COUNT(*) FILTER (WHERE status = 'rejected') as rejected
             FROM applications 
             WHERE freelancer_id = $1`,
            [id]
        );

        const cvsResult = await db.query(
            'SELECT COUNT(*) as total_cvs FROM cvs WHERE user_id = $1',
            [id]
        );

        const portfolioResult = await db.query(
            'SELECT COUNT(*) as total_portfolio FROM portfolios WHERE user_id = $1',
            [id]
        );

        additionalData = {
            applications: applicationsResult.rows[0],
            cvs: parseInt(cvsResult.rows[0].total_cvs),
            portfolio_items: parseInt(portfolioResult.rows[0].total_portfolio)
        };
    }

    res.json({
        success: true,
        user: {
            ...user,
            ...additionalData
        }
    });
});

// ============================================
// SUSPEND/ACTIVATE USER (Admin)
// ============================================
const toggleUserStatus = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    // Prevent admin from deactivating themselves
    if (parseInt(id) === req.user.id) {
        return next(new AppError('You cannot deactivate your own account', 400));
    }

    const userCheck = await db.query(
        'SELECT id, is_active, role FROM users WHERE id = $1',
        [id]
    );

    if (userCheck.rows.length === 0) {
        return next(new AppError('User not found', 404));
    }

    // Prevent deactivating other admins
    if (userCheck.rows[0].role === 'admin') {
        return next(new AppError('Cannot deactivate admin accounts', 403));
    }

    const currentStatus = userCheck.rows[0].is_active;
    const newStatus = !currentStatus;

    await db.query(
        'UPDATE users SET is_active = $1, updated_at = NOW() WHERE id = $2',
        [newStatus, id]
    );

    res.json({
        success: true,
        message: `User ${newStatus ? 'activated' : 'suspended'} successfully`,
        is_active: newStatus
    });
});

// ============================================
// DELETE USER (Admin)
// ============================================
const deleteUser = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    // Prevent admin from deleting themselves
    if (parseInt(id) === req.user.id) {
        return next(new AppError('You cannot delete your own account', 400));
    }

    const userCheck = await db.query(
        'SELECT id, role FROM users WHERE id = $1',
        [id]
    );

    if (userCheck.rows.length === 0) {
        return next(new AppError('User not found', 404));
    }

    // Prevent deleting other admins
    if (userCheck.rows[0].role === 'admin') {
        return next(new AppError('Cannot delete admin accounts', 403));
    }

    // Delete user (cascade will handle related records)
    await db.query('DELETE FROM users WHERE id = $1', [id]);

    res.json({
        success: true,
        message: 'User deleted successfully'
    });
});

// ============================================
// GET ADMIN STATISTICS
// ============================================
const getAdminStats = asyncHandler(async (req, res, next) => {
    // Total users by role
    const usersResult = await db.query(
        `SELECT 
            COUNT(*) as total_users,
            COUNT(*) FILTER (WHERE role = 'freelancer') as freelancers,
            COUNT(*) FILTER (WHERE role = 'employer') as employers,
            COUNT(*) FILTER (WHERE role = 'admin') as admins,
            COUNT(*) FILTER (WHERE is_active = true) as active_users,
            COUNT(*) FILTER (WHERE is_active = false) as inactive_users
         FROM users`
    );

    // Total jobs
    const jobsResult = await db.query(
        `SELECT 
            COUNT(*) as total_jobs,
            COUNT(*) FILTER (WHERE status = 'active') as active_jobs,
            COUNT(*) FILTER (WHERE status = 'closed') as closed_jobs
         FROM jobs`
    );

    // Total applications
    const applicationsResult = await db.query(
        `SELECT 
            COUNT(*) as total_applications,
            COUNT(*) FILTER (WHERE status = 'pending') as pending,
            COUNT(*) FILTER (WHERE status = 'accepted') as accepted,
            COUNT(*) FILTER (WHERE status = 'rejected') as rejected
         FROM applications`
    );

    // Recent registrations (last 30 days)
    const recentUsersResult = await db.query(
        `SELECT COUNT(*) as count 
         FROM users 
         WHERE created_at >= NOW() - INTERVAL '30 days'`
    );

    // User growth by month (last 6 months)
    const growthResult = await db.query(
        `SELECT 
            TO_CHAR(created_at, 'Mon YYYY') as month,
            COUNT(*) as count
         FROM users
         WHERE created_at >= NOW() - INTERVAL '6 months'
         GROUP BY TO_CHAR(created_at, 'Mon YYYY'), DATE_TRUNC('month', created_at)
         ORDER BY DATE_TRUNC('month', created_at) ASC`
    );

    res.json({
        success: true,
        stats: {
            users: usersResult.rows[0],
            jobs: jobsResult.rows[0],
            applications: applicationsResult.rows[0],
            recent_registrations: parseInt(recentUsersResult.rows[0].count),
            user_growth: growthResult.rows
        }
    });
});

// ============================================
// BULK ACTIONS (Admin)
// ============================================
const bulkUserAction = asyncHandler(async (req, res, next) => {
    const { action, user_ids } = req.body;

    if (!action || !user_ids || !Array.isArray(user_ids) || user_ids.length === 0) {
        return next(new AppError('Invalid request. Provide action and user_ids array.', 400));
    }

    // Prevent action on current admin
    if (user_ids.includes(req.user.id)) {
        return next(new AppError('Cannot perform bulk action on your own account', 400));
    }

    // Prevent action on other admins
    const adminCheck = await db.query(
        'SELECT id FROM users WHERE id = ANY($1) AND role = $2',
        [user_ids, 'admin']
    );

    if (adminCheck.rows.length > 0) {
        return next(new AppError('Cannot perform bulk action on admin accounts', 403));
    }

    let result;

    switch (action) {
        case 'activate':
            result = await db.query(
                'UPDATE users SET is_active = true, updated_at = NOW() WHERE id = ANY($1)',
                [user_ids]
            );
            break;

        case 'suspend':
            result = await db.query(
                'UPDATE users SET is_active = false, updated_at = NOW() WHERE id = ANY($1)',
                [user_ids]
            );
            break;

        case 'delete':
            result = await db.query(
                'DELETE FROM users WHERE id = ANY($1)',
                [user_ids]
            );
            break;

        default:
            return next(new AppError('Invalid action', 400));
    }

    res.json({
        success: true,
        message: `Bulk ${action} completed successfully`,
        affected: result.rowCount
    });
});
// ============================================
// GET ALL JOBS (Admin)
// ============================================
const getAllJobs = asyncHandler(async (req, res, next) => {
  const { status, category, search, page = 1, limit = 20 } = req.query;

  let query = `
        SELECT 
            j.*,
            u.name as employer_name,
            u.email as employer_email,
            jc.name as category_name,
            COUNT(DISTINCT a.id) as application_count
        FROM jobs j
        LEFT JOIN users u ON j.employer_id = u.id
        LEFT JOIN job_categories jc ON j.category_id = jc.id
        LEFT JOIN applications a ON j.id = a.job_id
        WHERE 1=1
    `;

  const params = [];
  let paramIndex = 1;

  // Filter by status (includes special 'expired' virtual status)
  if (status === "expired") {
    query += ` AND j.expires_at IS NOT NULL AND j.expires_at < NOW()`;
  } else if (status && ["active", "closed", "pending"].includes(status)) {
    query += ` AND j.status = $${paramIndex}`;
    params.push(status);
    paramIndex++;
  }

  // Filter by category
  if (category) {
    query += ` AND j.category_id = $${paramIndex}`;
    params.push(category);
    paramIndex++;
  }

  // Search by title or description
  if (search) {
    query += ` AND (LOWER(j.title) LIKE $${paramIndex} OR LOWER(j.description) LIKE $${paramIndex})`;
    params.push(`%${search.toLowerCase()}%`);
    paramIndex++;
  }

  query += ` GROUP BY j.id, u.name, u.email, jc.name ORDER BY j.created_at DESC`;

  // Pagination
  const offset = (page - 1) * limit;
  query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
  params.push(limit, offset);

  const result = await db.query(query, params);

  // Get total count
  let countQuery = "SELECT COUNT(*) as total FROM jobs WHERE 1=1";
  const countParams = [];
  let countParamIndex = 1;

  if (status === "expired") {
    countQuery += ` AND expires_at IS NOT NULL AND expires_at < NOW()`;
  } else if (status && ["active", "closed", "pending"].includes(status)) {
    countQuery += ` AND status = $${countParamIndex}`;
    countParams.push(status);
    countParamIndex++;
  }

  if (category) {
    countQuery += ` AND category_id = $${countParamIndex}`;
    countParams.push(category);
    countParamIndex++;
  }

  if (search) {
    countQuery += ` AND (LOWER(title) LIKE $${countParamIndex} OR LOWER(description) LIKE $${countParamIndex})`;
    countParams.push(`%${search.toLowerCase()}%`);
  }

  const countResult = await db.query(countQuery, countParams);
  const total = parseInt(countResult.rows[0].total);

  res.json({
    success: true,
    jobs: result.rows,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

// ============================================
// GET JOB BY ID (Admin)
// ============================================
const getJobById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const jobResult = await db.query(
    `SELECT 
            j.*,
            u.name as employer_name,
            u.email as employer_email,
            u.phone as employer_phone,
            jc.name as category_name
         FROM jobs j
         LEFT JOIN users u ON j.employer_id = u.id
         LEFT JOIN job_categories jc ON j.category_id = jc.id
         WHERE j.id = $1`,
    [id],
  );

  if (jobResult.rows.length === 0) {
    return next(new AppError("Job not found", 404));
  }

  const job = jobResult.rows[0];

  // Get application statistics
  const appStats = await db.query(
    `SELECT 
            COUNT(*) as total_applications,
            COUNT(*) FILTER (WHERE status = 'pending') as pending,
            COUNT(*) FILTER (WHERE status = 'shortlisted') as shortlisted,
            COUNT(*) FILTER (WHERE status = 'accepted') as accepted,
            COUNT(*) FILTER (WHERE status = 'rejected') as rejected
         FROM applications 
         WHERE job_id = $1`,
    [id],
  );

  res.json({
    success: true,
    job: {
      ...job,
      applications: appStats.rows[0],
    },
  });
});

// ============================================
// UPDATE JOB STATUS (Admin)
// ============================================
const updateJobStatus = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!["active", "closed", "draft"].includes(status)) {
    return next(
      new AppError("Invalid status. Use: active, closed, or draft", 400),
    );
  }

  const jobCheck = await db.query("SELECT id FROM jobs WHERE id = $1", [id]);

  if (jobCheck.rows.length === 0) {
    return next(new AppError("Job not found", 404));
  }

  await db.query("UPDATE jobs SET status = $1, updated_at = NOW() WHERE id = $2", [
    status,
    id,
  ]);

  res.json({
    success: true,
    message: `Job status updated to ${status}`,
    status,
  });
});

// ============================================
// DELETE JOB (Admin)
// ============================================
const deleteJob = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const jobCheck = await db.query("SELECT id FROM jobs WHERE id = $1", [id]);

  if (jobCheck.rows.length === 0) {
    return next(new AppError("Job not found", 404));
  }

  // Delete job (cascade will handle applications)
  await db.query("DELETE FROM jobs WHERE id = $1", [id]);

  res.json({
    success: true,
    message: "Job deleted successfully",
  });
});

// ============================================
// GET JOB STATISTICS (Admin)
// ============================================
const getJobStats = asyncHandler(async (req, res, next) => {
  // Total jobs by status
  const jobsResult = await db.query(
    `SELECT 
            COUNT(*) as total_jobs,
            COUNT(*) FILTER (WHERE status = 'active') as active_jobs,
            COUNT(*) FILTER (WHERE status = 'closed') as closed_jobs,
            COUNT(*) FILTER (WHERE status = 'draft') as draft_jobs
         FROM jobs`,
  );

  // Jobs by category
  const categoryResult = await db.query(
    `SELECT 
            jc.name as category,
            COUNT(j.id) as count
         FROM job_categories jc
         LEFT JOIN jobs j ON jc.id = j.category_id
         GROUP BY jc.name
         ORDER BY count DESC
         LIMIT 10`,
  );

  // Recent jobs (last 30 days)
  const recentJobsResult = await db.query(
    `SELECT COUNT(*) as count 
         FROM jobs 
         WHERE created_at >= NOW() - INTERVAL '30 days'`,
  );

  // Jobs with most applications
  const topJobsResult = await db.query(
    `SELECT 
            j.id,
            j.title,
            j.employer_id,
            u.name as employer_name,
            COUNT(a.id) as application_count
         FROM jobs j
         LEFT JOIN users u ON j.employer_id = u.id
         LEFT JOIN applications a ON j.id = a.job_id
         GROUP BY j.id, u.name
         ORDER BY application_count DESC
         LIMIT 5`,
  );

  // Job growth by month (last 6 months)
  const growthResult = await db.query(
    `SELECT 
            TO_CHAR(created_at, 'Mon YYYY') as month,
            COUNT(*) as count
         FROM jobs
         WHERE created_at >= NOW() - INTERVAL '6 months'
         GROUP BY TO_CHAR(created_at, 'Mon YYYY'), DATE_TRUNC('month', created_at)
         ORDER BY DATE_TRUNC('month', created_at) ASC`,
  );

  res.json({
    success: true,
    stats: {
      jobs: jobsResult.rows[0],
      by_category: categoryResult.rows,
      recent_jobs: parseInt(recentJobsResult.rows[0].count),
      top_jobs: topJobsResult.rows,
      job_growth: growthResult.rows,
    },
  });
});

// ============================================
// BULK JOB ACTIONS (Admin)
// ============================================
const bulkJobAction = asyncHandler(async (req, res, next) => {
  const { action, job_ids } = req.body;

  if (!action || !job_ids || !Array.isArray(job_ids) || job_ids.length === 0) {
    return next(
      new AppError("Invalid request. Provide action and job_ids array.", 400),
    );
  }

  let result;

  switch (action) {
    case "activate":
      result = await db.query(
        "UPDATE jobs SET status = $1, updated_at = NOW() WHERE id = ANY($2)",
        ["active", job_ids],
      );
      break;

    case "close":
      result = await db.query(
        "UPDATE jobs SET status = $1, updated_at = NOW() WHERE id = ANY($2)",
        ["closed", job_ids],
      );
      break;

    case "delete":
      result = await db.query("DELETE FROM jobs WHERE id = ANY($1)", [job_ids]);
      break;

    default:
      return next(new AppError("Invalid action", 400));
  }

  res.json({
    success: true,
    message: `Bulk ${action} completed successfully`,
    affected: result.rowCount,
  });
});

module.exports = {
  checkAdmin,
  getAllUsers,
  getUserById,
  toggleUserStatus,
  deleteUser,
  getAdminStats,
  bulkUserAction,
  getAllJobs,
  getJobById,
  updateJobStatus,
  deleteJob,
  getJobStats,
  bulkJobAction,
};