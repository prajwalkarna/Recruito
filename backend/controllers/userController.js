const db = require('../db');
const bcrypt = require('bcryptjs');

// GET USER PROFILE
// ============================================
const getUserProfile = async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await db.query(
            `SELECT 
                id, name, email, phone, bio, 
                profile_picture, role, is_active, 
                is_verified, created_at, updated_at 
             FROM users 
             WHERE id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ 
                success: false,
                error: 'User not found' 
            });
        }

        res.json({ 
            success: true,
            user: result.rows[0] 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            success: false,
            error: 'Server error' 
        });
    }
};

// UPDATE USER PROFILE
// ============================================
const updateUserProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Users can only update their own profile (unless admin)
        if (parseInt(id) !== userId && req.user.role !== 'admin') {
            return res.status(403).json({ 
                success: false,
                error: 'Unauthorized to update this profile' 
            });
        }

        const { name, email, phone, bio } = req.body;

        // Validate required fields
        if (!name || !email) {
            return res.status(400).json({ 
                success: false,
                error: 'Name and email are required' 
            });
        }

        // Check if email is already taken by another user
        const emailCheck = await db.query(
            'SELECT id FROM users WHERE email = $1 AND id != $2',
            [email, id]
        );

        if (emailCheck.rows.length > 0) {
            return res.status(400).json({ 
                success: false,
                error: 'Email already in use' 
            });
        }

        const result = await db.query(
            `UPDATE users 
             SET name = $1, email = $2, phone = $3, bio = $4, updated_at = NOW() 
             WHERE id = $5 
             RETURNING id, name, email, phone, bio, profile_picture, role, created_at, updated_at`,
            [name, email, phone || null, bio || null, id]
        );

        res.json({ 
            success: true,
            message: 'Profile updated successfully',
            user: result.rows[0] 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            success: false,
            error: 'Server error' 
        });
    }
};

// CHANGE PASSWORD
// ============================================
const changePassword = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const { currentPassword, newPassword } = req.body;

        // Users can only change their own password
        if (parseInt(id) !== userId) {
            return res.status(403).json({ 
                success: false,
                error: 'Unauthorized' 
            });
        }

        // Validate input
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ 
                success: false,
                error: 'Current password and new password are required' 
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ 
                success: false,
                error: 'New password must be at least 6 characters' 
            });
        }

        // Get current password from database
        const userResult = await db.query(
            'SELECT password FROM users WHERE id = $1',
            [id]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({ 
                success: false,
                error: 'User not found' 
            });
        }

        // Verify current password
        const isMatch = await bcrypt.compare(
            currentPassword, 
            userResult.rows[0].password
        );

        if (!isMatch) {
            return res.status(400).json({ 
                success: false,
                error: 'Current password is incorrect' 
            });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password
        await db.query(
            'UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2',
            [hashedPassword, id]
        );

        res.json({ 
            success: true,
            message: 'Password changed successfully' 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            success: false,
            error: 'Server error' 
        });
    }
};

// GET PUBLIC PROFILE (for viewing other users)
// ============================================
const getPublicProfile = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Return limited public info (no email, phone)
        const result = await db.query(
            `SELECT 
                id, name, bio, profile_picture, 
                role, created_at 
             FROM users 
             WHERE id = $1 AND is_active = true`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ 
                success: false,
                error: 'User not found' 
            });
        }

        res.json({ 
            success: true,
            user: result.rows[0] 
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
    getUserProfile, 
    updateUserProfile, 
    changePassword,
    getPublicProfile 
};