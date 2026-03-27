const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
    createPortfolio,
    getMyPortfolio,
    getPublicPortfolio,
    getPortfolioById,
    updatePortfolio,
    deletePortfolio,
    uploadPortfolioFile
} = require('../controllers/portfolioController');
const { verifyToken } = require('../middleware/authMiddleware');
const { uploadLimiter } = require('../middleware/security');
const { validatePortfolio, validateId } = require('../middleware/validators');

// Multer configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/portfolios/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|pdf/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('Only images and PDFs are allowed'));
        }
    }
});

// Routes
router.post('/', verifyToken, validatePortfolio, createPortfolio);
router.get('/my-portfolio', verifyToken, getMyPortfolio);
router.get('/user/:userId', validateId, getPublicPortfolio);
router.get('/:id', verifyToken, validateId, getPortfolioById);
router.put('/:id', verifyToken, validateId, validatePortfolio, updatePortfolio);
router.delete('/:id', verifyToken, validateId, deletePortfolio);
router.post('/:portfolioId/upload', verifyToken, uploadLimiter, validateId, upload.single('portfolioFile'), uploadPortfolioFile);

module.exports = router;