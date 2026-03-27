const express = require('express');
const router = express.Router();
const {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategoryStats
} = require('../controllers/categoryController');
const { verifyToken } = require('../middleware/authMiddleware');
const { body } = require('express-validator');
const { handleValidationErrors } = require('../middleware/validators');

// Validation
const validateCategory = [
    body('name')
        .trim()
        .notEmpty().withMessage('Category name is required')
        .isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 }).withMessage('Description must be under 500 characters'),
    handleValidationErrors
];

// Public routes
router.get('/', getAllCategories);
router.get('/:id', getCategoryById);

// Admin routes (protected)
router.post('/', verifyToken, validateCategory, createCategory);
router.put('/:id', verifyToken, validateCategory, updateCategory);
router.delete('/:id', verifyToken, deleteCategory);
router.get('/stats/all', verifyToken, getCategoryStats);

module.exports = router;