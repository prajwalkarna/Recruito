const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const xss = require('xss-clean');
const hpp = require('hpp');

// Rate limiting for general API
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10000, // Increased for development/testing

    message: {
        success: false,
        error: 'Too many requests from this IP, please try again after 15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Stricter rate limiting for authentication routes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // Increased for development/testing

    message: {
        success: false,
        error: 'Too many login attempts, please try again after 15 minutes'
    },
    skipSuccessfulRequests: true // Don't count successful requests
});

// Rate limiting for registration
const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 200, // Increased for development/testing

    message: {
        success: false,
        error: 'Too many accounts created from this IP, please try again after an hour'
    }
});

// Rate limiting for password reset
const passwordResetLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 200, // Increased for development/testing

    message: {
        success: false,
        error: 'Too many password reset attempts, please try again after an hour'
    }
});

// Rate limiting for file uploads
const uploadLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // Increased for development/testing

    message: {
        success: false,
        error: 'Too many file uploads, please try again later'
    }
});

// Security headers configuration
const securityHeaders = helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        }
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
});

// Sanitization middleware
const sanitizeData = [
    (req, res, next) => {
        // Express 5 req.query and req.params are getters/read-only by default
        // We must redefine them to be writable so sanitizers can modify them
        const query = { ...req.query };
        const params = { ...req.params };
        
        Object.defineProperty(req, 'query', { value: query, writable: true, configurable: true });
        Object.defineProperty(req, 'params', { value: params, writable: true, configurable: true });
        
        next();
    },
    xss(), // Prevent XSS attacks
    hpp() // Prevent HTTP Parameter Pollution
];

module.exports = {
    apiLimiter,
    authLimiter,
    registerLimiter,
    passwordResetLimiter,
    uploadLimiter,
    securityHeaders,
    sanitizeData
};