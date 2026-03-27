const db = require('../db');
const fs = require('fs');
const path = require('path');

// ============================================
// CREATE PORTFOLIO ITEM
// ============================================
const createPortfolio = async (req, res) => {
    try {
        const userId = req.user.id;
        const { title, description, project_url, tags } = req.body;

        if (!title) {
            return res.status(400).json({
                success: false,
                error: 'Title is required'
            });
        }

        const result = await db.query(
            `INSERT INTO portfolios 
                (user_id, title, description, project_url, tags)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [
                userId,
                title,
                description || null,
                project_url || null,
                tags ? JSON.stringify(tags) : '[]'
            ]
        );

        res.status(201).json({
            success: true,
            message: 'Portfolio item created successfully',
            portfolio: result.rows[0]
        });

    } catch (error) {
        console.error('Create portfolio error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
};

// ============================================
// GET USER'S PORTFOLIO ITEMS
// ============================================
const getMyPortfolio = async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await db.query(
            `SELECT * FROM portfolios 
             WHERE user_id = $1 
             ORDER BY created_at DESC`,
            [userId]
        );

        res.json({
            success: true,
            portfolio: result.rows,
            total: result.rows.length
        });

    } catch (error) {
        console.error('Get portfolio error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
};

// ============================================
// GET PUBLIC PORTFOLIO (by user ID)
// ============================================
const getPublicPortfolio = async (req, res) => {
    try {
        const { userId } = req.params;

        const result = await db.query(
            `SELECT 
                p.*,
                u.name as user_name,
                u.bio as user_bio
             FROM portfolios p
             JOIN users u ON p.user_id = u.id
             WHERE p.user_id = $1
             ORDER BY p.created_at DESC`,
            [userId]
        );

        res.json({
            success: true,
            portfolio: result.rows,
            total: result.rows.length
        });

    } catch (error) {
        console.error('Get public portfolio error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
};

// ============================================
// GET SINGLE PORTFOLIO ITEM
// ============================================
const getPortfolioById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const result = await db.query(
            'SELECT * FROM portfolios WHERE id = $1 AND user_id = $2',
            [id, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Portfolio item not found'
            });
        }

        res.json({
            success: true,
            portfolio: result.rows[0]
        });

    } catch (error) {
        console.error('Get portfolio by ID error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
};

// ============================================
// UPDATE PORTFOLIO ITEM
// ============================================
const updatePortfolio = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const { title, description, project_url, tags } = req.body;

        // Check if portfolio belongs to user
        const check = await db.query(
            'SELECT id FROM portfolios WHERE id = $1 AND user_id = $2',
            [id, userId]
        );

        if (check.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Portfolio item not found'
            });
        }

        const result = await db.query(
            `UPDATE portfolios 
             SET title = $1, description = $2, project_url = $3, tags = $4, updated_at = NOW()
             WHERE id = $5 AND user_id = $6
             RETURNING *`,
            [
                title,
                description || null,
                project_url || null,
                tags ? JSON.stringify(tags) : '[]',
                id,
                userId
            ]
        );

        res.json({
            success: true,
            message: 'Portfolio item updated successfully',
            portfolio: result.rows[0]
        });

    } catch (error) {
        console.error('Update portfolio error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
};

// ============================================
// DELETE PORTFOLIO ITEM
// ============================================
const deletePortfolio = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Get portfolio to find file path
        const portfolio = await db.query(
            'SELECT file_url FROM portfolios WHERE id = $1 AND user_id = $2',
            [id, userId]
        );

        if (portfolio.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Portfolio item not found'
            });
        }

        // Delete file if exists
        if (portfolio.rows[0].file_url) {
            const filePath = path.join(__dirname, '..', portfolio.rows[0].file_url);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        // Delete from database
        await db.query(
            'DELETE FROM portfolios WHERE id = $1 AND user_id = $2',
            [id, userId]
        );

        res.json({
            success: true,
            message: 'Portfolio item deleted successfully'
        });

    } catch (error) {
        console.error('Delete portfolio error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
};

// ============================================
// UPLOAD PORTFOLIO FILE
// ============================================
const uploadPortfolioFile = async (req, res) => {
    try {
        const { portfolioId } = req.params;
        const userId = req.user.id;

        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No file uploaded'
            });
        }

        // Check if portfolio belongs to user
        const check = await db.query(
            'SELECT id FROM portfolios WHERE id = $1 AND user_id = $2',
            [portfolioId, userId]
        );

        if (check.rows.length === 0) {
            // Delete uploaded file
            fs.unlinkSync(req.file.path);
            return res.status(404).json({
                success: false,
                error: 'Portfolio item not found'
            });
        }

        const fileUrl = `/uploads/portfolios/${req.file.filename}`;

        // Update portfolio with file URL
        const result = await db.query(
            `UPDATE portfolios 
             SET file_url = $1, updated_at = NOW()
             WHERE id = $2 AND user_id = $3
             RETURNING *`,
            [fileUrl, portfolioId, userId]
        );

        res.json({
            success: true,
            message: 'File uploaded successfully',
            fileUrl,
            portfolio: result.rows[0]
        });

    } catch (error) {
        console.error('Upload portfolio file error:', error);
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
};

module.exports = {
    createPortfolio,
    getMyPortfolio,
    getPublicPortfolio,
    getPortfolioById,
    updatePortfolio,
    deletePortfolio,
    uploadPortfolioFile
};