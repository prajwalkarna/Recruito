const bcrypt = require('bcryptjs');
const db = require('../db');
const { AppError, asyncHandler } = require('../middleware/errorHandler');

// ============================================
// GET USER SETTINGS
// ============================================
exports.getSettings = asyncHandler(async (req, res, next) => {
    const userId = req.user.id;

    const result = await db.query(
        `SELECT 
            u.id,
            u.name,
            u.email,
            u.phone,
            u.bio,
            u.profile_picture,
            u.is_active,
            us.theme,
            us.accent_color,
            us.email_notifications,
            us.push_notifications,
            us.job_alert_notifications,
            us.message_notifications,
            us.application_notifications
         FROM users u
         LEFT JOIN user_settings us ON u.id = us.user_id
         WHERE u.id = $1`,
        [userId]
    );

    if (result.rows.length === 0) {
        return next(new AppError('User not found', 404));
    }

    res.json({
        success: true,
        settings: result.rows[0]
    });
});

// ============================================
// UPDATE ACCOUNT INFO
// ============================================
exports.updateAccountInfo = asyncHandler(async (req, res, next) => {
    const userId = req.user.id;
    const { name, phone, bio } = req.body;

    const result = await db.query(
        `UPDATE users 
         SET name = $1, phone = $2, bio = $3, updated_at = NOW()
         WHERE id = $4
         RETURNING id, name, email, phone, bio, profile_picture`,
        [name, phone || null, bio || null, userId]
    );

    res.json({
        success: true,
        message: 'Account information updated successfully',
        user: result.rows[0]
    });
});

// ============================================
// CHANGE EMAIL
// ============================================
exports.changeEmail = asyncHandler(async (req, res, next) => {
    const userId = req.user.id;
    const { new_email, password } = req.body;

    if (!new_email || !password) {
        return next(new AppError('Email and password are required', 400));
    }

    // Verify current password
    const userResult = await db.query(
        'SELECT password FROM users WHERE id = $1',
        [userId]
    );

    const isPasswordValid = await bcrypt.compare(password, userResult.rows[0].password);
    if (!isPasswordValid) {
        return next(new AppError('Incorrect password', 401));
    }

    // Check if email already exists
    const emailExists = await db.query(
        'SELECT id FROM users WHERE email = $1 AND id != $2',
        [new_email, userId]
    );

    if (emailExists.rows.length > 0) {
        return next(new AppError('Email already in use', 400));
    }

    // Update email
    await db.query(
        'UPDATE users SET email = $1, updated_at = NOW() WHERE id = $2',
        [new_email, userId]
    );

    res.json({
        success: true,
        message: 'Email updated successfully'
    });
});

// ============================================
// CHANGE PASSWORD
// ============================================
exports.changePassword = asyncHandler(async (req, res, next) => {
    const userId = req.user.id;
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
        return next(new AppError('Current and new password are required', 400));
    }

    if (new_password.length < 6) {
        return next(new AppError('New password must be at least 6 characters', 400));
    }

    // Get current password
    const result = await db.query(
        'SELECT password FROM users WHERE id = $1',
        [userId]
    );

    // Verify current password
    const isPasswordValid = await bcrypt.compare(current_password, result.rows[0].password);
    if (!isPasswordValid) {
        return next(new AppError('Current password is incorrect', 401));
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(new_password, 10);

    // Update password
    await db.query(
        'UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2',
        [hashedPassword, userId]
    );

    res.json({
        success: true,
        message: 'Password changed successfully'
    });
});

// ============================================
// UPDATE NOTIFICATION SETTINGS
// ============================================
exports.updateNotificationSettings = asyncHandler(async (req, res, next) => {
    const userId = req.user.id;
    const {
        email_notifications,
        push_notifications,
        job_alert_notifications,
        message_notifications,
        application_notifications
    } = req.body;

    // Check if settings exist
    const check = await db.query(
        'SELECT id FROM user_settings WHERE user_id = $1',
        [userId]
    );

    if (check.rows.length === 0) {
        // Create settings
        await db.query(
            `INSERT INTO user_settings 
                (user_id, email_notifications, push_notifications, job_alert_notifications, 
                 message_notifications, application_notifications)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [
                userId,
                email_notifications ?? true,
                push_notifications ?? true,
                job_alert_notifications ?? true,
                message_notifications ?? true,
                application_notifications ?? true
            ]
        );
    } else {
        // Update settings
        await db.query(
            `UPDATE user_settings 
             SET email_notifications = $1,
                 push_notifications = $2,
                 job_alert_notifications = $3,
                 message_notifications = $4,
                 application_notifications = $5,
                 updated_at = NOW()
             WHERE user_id = $6`,
            [
                email_notifications,
                push_notifications,
                job_alert_notifications,
                message_notifications,
                application_notifications,
                userId
            ]
        );
    }

    res.json({
        success: true,
        message: 'Notification settings updated successfully'
    });
});

// ============================================
// DEACTIVATE ACCOUNT
// ============================================
exports.deactivateAccount = asyncHandler(async (req, res, next) => {
    const userId = req.user.id;
    const { password } = req.body;

    if (!password) {
        return next(new AppError('Password is required', 400));
    }

    // Verify password
    const result = await db.query(
        'SELECT password FROM users WHERE id = $1',
        [userId]
    );

    const isPasswordValid = await bcrypt.compare(password, result.rows[0].password);
    if (!isPasswordValid) {
        return next(new AppError('Incorrect password', 401));
    }

    // Deactivate account
    await db.query(
        'UPDATE users SET is_active = false, updated_at = NOW() WHERE id = $1',
        [userId]
    );

    res.json({
        success: true,
        message: 'Account deactivated successfully'
    });
});

// ============================================
// REACTIVATE ACCOUNT
// ============================================
exports.reactivateAccount = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new AppError('Email and password are required', 400));
    }

    // Get user
    const result = await db.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
    );

    if (result.rows.length === 0) {
        return next(new AppError('Invalid credentials', 401));
    }

    const user = result.rows[0];

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        return next(new AppError('Invalid credentials', 401));
    }

    // Reactivate account
    await db.query(
        'UPDATE users SET is_active = true, updated_at = NOW() WHERE id = $1',
        [user.id]
    );

    res.json({
        success: true,
        message: 'Account reactivated successfully'
    });
});

// ============================================
// DELETE ACCOUNT
// ============================================
exports.deleteAccount = asyncHandler(async (req, res, next) => {
    const userId = req.user.id;
    const { password, confirmation } = req.body;

    if (!password || confirmation !== 'DELETE') {
        return next(new AppError('Password and confirmation required', 400));
    }

    // Verify password
    const result = await db.query(
        'SELECT password FROM users WHERE id = $1',
        [userId]
    );

    const isPasswordValid = await bcrypt.compare(password, result.rows[0].password);
    if (!isPasswordValid) {
        return next(new AppError('Incorrect password', 401));
    }

    // Delete account (cascade will handle related records)
    await db.query('DELETE FROM users WHERE id = $1', [userId]);

    res.json({
        success: true,
        message: 'Account deleted successfully'
    });
});

// ============================================
// EXPORT USER DATA
// ============================================
exports.exportUserData = asyncHandler(async (req, res, next) => {
    const userId = req.user.id;

    // Get all user data
    const [user, jobs, applications, cvs, portfolios, messages] = await Promise.all([
        db.query('SELECT * FROM users WHERE id = $1', [userId]),
        db.query('SELECT * FROM jobs WHERE employer_id = $1', [userId]),
        db.query('SELECT * FROM applications WHERE freelancer_id = $1', [userId]),
        db.query('SELECT * FROM cvs WHERE user_id = $1', [userId]),
        db.query('SELECT * FROM portfolios WHERE user_id = $1', [userId]),
        db.query('SELECT * FROM messages WHERE sender_id = $1 OR receiver_id = $1', [userId])
    ]);

    const userData = {
        user: user.rows[0],
        jobs: jobs.rows,
        applications: applications.rows,
        cvs: cvs.rows,
        portfolios: portfolios.rows,
        messages: messages.rows,
        exported_at: new Date().toISOString()
    };

    res.json({
        success: true,
        data: userData
    });
});

// ============================================
// GET THEME PREFERENCES
// ============================================
exports.getThemePreferences = asyncHandler(async (req, res, next) => {
    const userId = req.user.id;

    const result = await db.query(
        `SELECT theme, accent_color 
         FROM user_settings 
         WHERE user_id = $1`,
        [userId]
    );

    // Return defaults if no preferences exist
    const preferences = result.rows.length > 0 
        ? result.rows[0] 
        : { theme: 'light', accent_color: '#667eea' };

    res.json({
        success: true,
        preferences
    });
});

// ============================================
// UPDATE THEME PREFERENCES
// ============================================
exports.updateThemePreferences = asyncHandler(async (req, res, next) => {
    const userId = req.user.id;
    const { theme, accent_color } = req.body;

    // Validate theme
    if (theme && !['light', 'dark', 'system'].includes(theme)) {
        return next(new AppError('Invalid theme. Use: light, dark or system', 400));
    }

    // Validate accent color (basic hex color validation)
    if (accent_color && !/^#[0-9A-Fa-f]{6}$/.test(accent_color)) {
        return next(new AppError('Invalid accent color. Use hex format (#RRGGBB)', 400));
    }

    // Check if settings exist
    const check = await db.query(
        'SELECT id FROM user_settings WHERE user_id = $1',
        [userId]
    );

    if (check.rows.length === 0) {
        // Create settings with theme
        await db.query(
            `INSERT INTO user_settings (user_id, theme, accent_color) 
             VALUES ($1, $2, $3)`,
            [userId, theme || 'system', accent_color || '#667eea']
        );
    } else {
        // Update theme preferences
        const updates = [];
        const params = [];
        let paramIndex = 1;

        if (theme !== undefined) {
            updates.push(`theme = $${paramIndex}`);
            params.push(theme);
            paramIndex++;
        }

        if (accent_color !== undefined) {
            updates.push(`accent_color = $${paramIndex}`);
            params.push(accent_color);
            paramIndex++;
        }

        if (updates.length > 0) {
            params.push(userId);
            await db.query(
                `UPDATE user_settings 
                 SET ${updates.join(', ')}, updated_at = NOW() 
                 WHERE user_id = $${paramIndex}`,
                params
            );
        }
    }

    res.json({
        success: true,
        message: 'Theme preferences updated successfully',
        preferences: {
            theme: theme || 'system',
            accent_color: accent_color || '#667eea'
        }
    });
});