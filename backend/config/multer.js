const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// ============================================
// STORAGE CONFIG FOR PROFILE PICTURES
// ============================================
const profileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/profiles/');
    },
    filename: (req, file, cb) => {
        const uniqueName = uuidv4() + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});

// ============================================
// STORAGE CONFIG FOR CVs
// ============================================
const cvStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/cvs/');
    },
    filename: (req, file, cb) => {
        const uniqueName = uuidv4() + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});

// ============================================
// STORAGE CONFIG FOR PORTFOLIO
// ============================================
const portfolioStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/portfolios/');
    },
    filename: (req, file, cb) => {
        const uniqueName = uuidv4() + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});

// ============================================
// FILE FILTERS
// ============================================
const imageFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(
        path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed! (jpeg, jpg, png, webp)'));
    }
};

const cvFilter = (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx/;
    const extname = allowedTypes.test(
        path.extname(file.originalname).toLowerCase()
    );

    if (extname) {
        cb(null, true);
    } else {
        cb(new Error('Only PDF and Word documents are allowed!'));
    }
};

const portfolioFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp|pdf|doc|docx/;
    const extname = allowedTypes.test(
        path.extname(file.originalname).toLowerCase()
    );

    if (extname) {
        cb(null, true);
    } else {
        cb(new Error('Only images and documents are allowed!'));
    }
};

// ============================================
// EXPORT UPLOAD MIDDLEWARES
// ============================================
const uploadProfile = multer({
    storage: profileStorage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
    fileFilter: imageFilter
});

const uploadCV = multer({
    storage: cvStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: cvFilter
});

const uploadPortfolio = multer({
    storage: portfolioStorage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: portfolioFilter
});

module.exports = { uploadProfile, uploadCV, uploadPortfolio };