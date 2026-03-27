const { body, param, query, validationResult } = require('express-validator');

// Validation error handler
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            error: 'Validation failed',
            errors: errors.array().map(err => ({
                field: err.path,
                message: err.msg
            }))
        });
    }
    next();
};

// Auth validators
const validateRegister = [
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters')
        .matches(/^[a-zA-Z\s]+$/).withMessage('Name can only contain letters and spaces'),

    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Invalid email format')
        .normalizeEmail(),

    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain uppercase, lowercase, and number'),

    body('role')
        .notEmpty().withMessage('Role is required')
        .isIn(['freelancer', 'employer']).withMessage('Role must be freelancer or employer'),

    handleValidationErrors
];

const validateLogin = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Invalid email format')
        .normalizeEmail(),

    body('password')
        .notEmpty().withMessage('Password is required'),

    handleValidationErrors
];

// Job validators
const validateJob = [
    body('title')
        .trim()
        .notEmpty().withMessage('Job title is required')
        .isLength({ min: 5, max: 200 }).withMessage('Title must be 5-200 characters'),

    body('description')
        .trim()
        .notEmpty().withMessage('Description is required')
        .isLength({ min: 20, max: 5000 }).withMessage('Description must be 20-5000 characters'),

    body('job_type')
        .notEmpty().withMessage('Job type is required')
        .isIn(['full-time', 'part-time', 'contract', 'freelance']).withMessage('Invalid job type'),

    body('location')
        .optional()
        .trim()
        .isLength({ max: 200 }).withMessage('Location must be under 200 characters'),

    body('salary_min')
        .optional()
        .isFloat({ min: 0 }).withMessage('Minimum salary must be a positive number'),

    body('salary_max')
        .optional()
        .isFloat({ min: 0 }).withMessage('Maximum salary must be a positive number')
        .custom((value, { req }) => {
            if (req.body.salary_min && value < req.body.salary_min) {
                throw new Error('Maximum salary must be greater than minimum salary');
            }
            return true;
        }),

    handleValidationErrors
];

// Application validators
const validateApplication = [
    body('job_id')
        .notEmpty().withMessage('Job ID is required')
        .isInt({ min: 1 }).withMessage('Invalid job ID'),

    body('cv_id')
        .notEmpty().withMessage('CV ID is required')
        .isInt({ min: 1 }).withMessage('Invalid CV ID'),

    body('cover_letter')
        .optional()
        .trim()
        .isLength({ max: 2000 }).withMessage('Cover letter must be under 2000 characters'),

    handleValidationErrors
];

// Message validators
const validateMessage = [
    body('receiver_id')
        .notEmpty().withMessage('Receiver ID is required')
        .isInt({ min: 1 }).withMessage('Invalid receiver ID'),

    body('message')
        .trim()
        .notEmpty().withMessage('Message is required')
        .isLength({ min: 1, max: 1000 }).withMessage('Message must be 1-1000 characters'),

    handleValidationErrors
];

// Portfolio validators
const validatePortfolio = [
    body('title')
        .trim()
        .notEmpty().withMessage('Title is required')
        .isLength({ min: 3, max: 200 }).withMessage('Title must be 3-200 characters'),

    body('description')
        .optional()
        .trim()
        .isLength({ max: 1000 }).withMessage('Description must be under 1000 characters'),

    body('project_url')
        .optional()
        .trim()
        .isURL().withMessage('Invalid URL format'),

    handleValidationErrors
];

// ID parameter validator
const validateId = [
    param('id')
        .isInt({ min: 1 }).withMessage('Invalid ID'),
    handleValidationErrors
];

const validateJobId = [
    param('jobId')
        .isInt({ min: 1 }).withMessage('Invalid Job ID'),
    handleValidationErrors
];

const validateJobId_snake = [
    param('job_id')
        .isInt({ min: 1 }).withMessage('Invalid Job ID'),
    handleValidationErrors
];

const validateOtherUserId = [
    param('otherUserId')
        .isInt({ min: 1 }).withMessage('Invalid User ID'),
    handleValidationErrors
];

// Pagination validators
const validatePagination = [
    query('page')
        .optional()
        .isInt({ min: 1 }).withMessage('Page must be a positive integer'),

    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),

    handleValidationErrors
];

module.exports = {
    validateRegister,
    validateLogin,
    validateJob,
    validateApplication,
    validateMessage,
    validatePortfolio,
    validateId,
    validateJobId,
    validateJobId_snake,
    validateOtherUserId,
    validatePagination,
    handleValidationErrors
};