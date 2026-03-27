// Custom error class
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

// Global error handler
const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || 'Internal Server Error';

    // Log error for debugging
    if (process.env.NODE_ENV === 'development') {
        console.error('ERROR 💥:', err);
    }

    // PostgreSQL errors
    if (err.code === '23505') {
        // Unique constraint violation
        const field = err.detail?.match(/\(([^)]+)\)/)?.[1] || 'field';
        err.message = `${field} already exists`;
        err.statusCode = 400;
    }

    if (err.code === '23503') {
        // Foreign key violation
        err.message = 'Referenced record does not exist';
        err.statusCode = 400;
    }

    if (err.code === '22P02') {
        // Invalid input syntax
        err.message = 'Invalid data format';
        err.statusCode = 400;
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        err.message = 'Invalid token. Please login again';
        err.statusCode = 401;
    }

    if (err.name === 'TokenExpiredError') {
        err.message = 'Token expired. Please login again';
        err.statusCode = 401;
    }

    // Multer errors (file upload)
    if (err.name === 'MulterError') {
        if (err.code === 'LIMIT_FILE_SIZE') {
            err.message = 'File size too large. Maximum size is 10MB';
        } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            err.message = 'Unexpected file field';
        }
        err.statusCode = 400;
    }

    // Send error response
    const response = {
        success: false,
        error: err.message
    };

    // Include stack trace in development
    if (process.env.NODE_ENV === 'development') {
        response.stack = err.stack;
    }

    res.status(err.statusCode).json(response);
};

// 404 handler
const notFound = (req, res, next) => {
    const error = new AppError(`Route ${req.originalUrl} not found`, 404);
    next(error);
};

// Async handler wrapper
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
    AppError,
    errorHandler,
    notFound,
    asyncHandler
};