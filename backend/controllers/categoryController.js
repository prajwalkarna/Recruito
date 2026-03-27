const db = require('../db');
const { AppError, asyncHandler } = require('../middleware/errorHandler');

// ============================================
// GET ALL CATEGORIES (Public)
// ============================================
const getAllCategories = asyncHandler(async (req, res) => {
    const result = await db.query(
        'SELECT * FROM job_categories ORDER BY name ASC'
    );

    res.json({
        success: true,
        categories: result.rows,
        total: result.rows.length
    });
});

// ============================================
// GET SINGLE CATEGORY
// ============================================
const getCategoryById = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const result = await db.query(
        'SELECT * FROM job_categories WHERE id = $1',
        [id]
    );

    if (result.rows.length === 0) {
        return next(new AppError('Category not found', 404));
    }

    res.json({
        success: true,
        category: result.rows[0]
    });
});

// ============================================
// CREATE CATEGORY (Admin Only)
// ============================================
const createCategory = asyncHandler(async (req, res, next) => {
    const { name, description } = req.body;

    // Check if user is admin
    if (req.user.role !== 'admin') {
        return next(new AppError('Access denied. Admin only.', 403));
    }

    if (!name) {
        return next(new AppError('Category name is required', 400));
    }

    // Check if category already exists
    const existingCategory = await db.query(
        'SELECT id FROM job_categories WHERE LOWER(name) = LOWER($1)',
        [name]
    );

    if (existingCategory.rows.length > 0) {
        return next(new AppError('Category already exists', 400));
    }

    const result = await db.query(
        `INSERT INTO job_categories (name, description) 
         VALUES ($1, $2) 
         RETURNING *`,
        [name, description || null]
    );

    res.status(201).json({
        success: true,
        message: 'Category created successfully',
        category: result.rows[0]
    });
});

// ============================================
// UPDATE CATEGORY (Admin Only)
// ============================================
const updateCategory = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { name, description } = req.body;

    // Check if user is admin
    if (req.user.role !== 'admin') {
        return next(new AppError('Access denied. Admin only.', 403));
    }

    if (!name) {
        return next(new AppError('Category name is required', 400));
    }

    // Check if category exists
    const categoryCheck = await db.query(
        'SELECT id FROM job_categories WHERE id = $1',
        [id]
    );

    if (categoryCheck.rows.length === 0) {
        return next(new AppError('Category not found', 404));
    }

    // Check if new name conflicts with existing category (excluding current)
    const nameCheck = await db.query(
        'SELECT id FROM job_categories WHERE LOWER(name) = LOWER($1) AND id != $2',
        [name, id]
    );

    if (nameCheck.rows.length > 0) {
        return next(new AppError('Category name already exists', 400));
    }

    const result = await db.query(
        `UPDATE job_categories 
         SET name = $1, description = $2 
         WHERE id = $3 
         RETURNING *`,
        [name, description || null, id]
    );

    res.json({
        success: true,
        message: 'Category updated successfully',
        category: result.rows[0]
    });
});

// ============================================
// DELETE CATEGORY (Admin Only)
// ============================================
const deleteCategory = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    // Check if user is admin
    if (req.user.role !== 'admin') {
        return next(new AppError('Access denied. Admin only.', 403));
    }

    // Check if category exists
    const categoryCheck = await db.query(
        'SELECT id FROM job_categories WHERE id = $1',
        [id]
    );

    if (categoryCheck.rows.length === 0) {
        return next(new AppError('Category not found', 404));
    }

    // Check if category is being used by any jobs
    const jobsCheck = await db.query(
        'SELECT COUNT(*) as count FROM jobs WHERE category_id = $1',
        [id]
    );

    if (parseInt(jobsCheck.rows[0].count) > 0) {
        return next(new AppError(
            'Cannot delete category. It is being used by jobs. Please reassign jobs first.',
            400
        ));
    }

    await db.query('DELETE FROM job_categories WHERE id = $1', [id]);

    res.json({
        success: true,
        message: 'Category deleted successfully'
    });
});

// ============================================
// GET CATEGORY STATISTICS (Admin)
// ============================================
const getCategoryStats = asyncHandler(async (req, res, next) => {
    // Check if user is admin
    if (req.user.role !== 'admin') {
        return next(new AppError('Access denied. Admin only.', 403));
    }

    const result = await db.query(
        `SELECT 
            jc.id,
            jc.name,
            jc.description,
            COUNT(j.id) as job_count,
            COUNT(j.id) FILTER (WHERE j.status = 'active') as active_jobs
         FROM job_categories jc
         LEFT JOIN jobs j ON jc.id = j.category_id
         GROUP BY jc.id
         ORDER BY job_count DESC`
    );

    res.json({
        success: true,
        stats: result.rows
    });
});

module.exports = {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategoryStats
};