const path = require('path');
const fs = require('fs');
const db = require('../db');

// ============================================
// UPLOAD PROFILE PICTURE
// ============================================
exports.uploadProfilePicture = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const fileUrl = `/uploads/profiles/${req.file.filename}`;
        const userId = req.user.id;

        // Get old profile picture to delete it
        const oldUser = await db.query(
            'SELECT profile_picture FROM users WHERE id = $1',
            [userId]
        );

        // Delete old profile picture if exists
        if (oldUser.rows[0]?.profile_picture) {
            const oldPath = path.join(__dirname, '..', oldUser.rows[0].profile_picture);
            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }
        }

        // Update database with new profile picture
        await db.query(
            'UPDATE users SET profile_picture = $1, updated_at = NOW() WHERE id = $2',
            [fileUrl, userId]
        );

        res.status(200).json({
            message: 'Profile picture uploaded successfully',
            fileUrl
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error during upload' });
    }
};

// ============================================
// UPLOAD CV
// ============================================
exports.uploadCVFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const fileUrl = `/uploads/cvs/${req.file.filename}`;
        const userId = req.user.id;
        const { cvId } = req.params;

        // Update CV record with file URL
        await db.query(
            'UPDATE cvs SET file_url = $1, updated_at = NOW() WHERE id = $2 AND user_id = $3',
            [fileUrl, cvId, userId]
        );

        res.status(200).json({
            message: 'CV uploaded successfully',
            fileUrl
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error during upload' });
    }
};

// ============================================
// UPLOAD PORTFOLIO FILE
// ============================================
exports.uploadPortfolioFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const fileUrl = `/uploads/portfolios/${req.file.filename}`;
        const userId = req.user.id;
        const { title, description, tags } = req.body;

        // Determine file type
        const ext = path.extname(req.file.originalname).toLowerCase();
        const fileType = ['.jpg', '.jpeg', '.png', '.webp'].includes(ext)
            ? 'image'
            : 'document';

        // Save portfolio item to database
        const result = await db.query(
            `INSERT INTO portfolios 
            (user_id, title, description, file_url, file_type, tags) 
            VALUES ($1, $2, $3, $4, $5, $6) 
            RETURNING *`,
            [userId, title, description, fileUrl, fileType, tags ? JSON.parse(tags) : []]
        );

        res.status(201).json({
            message: 'Portfolio item uploaded successfully',
            portfolio: result.rows[0]
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error during upload' });
    }
};

// ============================================
// DELETE FILE
// ============================================
exports.deleteFile = async (req, res) => {
    try {
        const { type, id } = req.params;
        const userId = req.user.id;

        let fileUrl;
        let query;

        if (type === 'portfolio') {
            const result = await db.query(
                'SELECT file_url FROM portfolios WHERE id = $1 AND user_id = $2',
                [id, userId]
            );
            if (!result.rows[0]) {
                return res.status(404).json({ error: 'File not found' });
            }
            fileUrl = result.rows[0].file_url;
            await db.query(
                'DELETE FROM portfolios WHERE id = $1 AND user_id = $2',
                [id, userId]
            );
        }

        // Delete actual file from server
        if (fileUrl) {
            const filePath = path.join(__dirname, '..', fileUrl);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        res.status(200).json({ message: 'File deleted successfully' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error during deletion' });
    }
};