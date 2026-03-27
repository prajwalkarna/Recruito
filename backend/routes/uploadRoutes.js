const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { verifyToken } = require('../middleware/authMiddleware');
const { uploadLimiter } = require('../middleware/security');
const { uploadCVFile, uploadProfilePicture, uploadPortfolioFile } = require('../controllers/uploadController');

// Multer configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.fieldname === 'profilePicture') {
            cb(null, 'uploads/profiles/');
        } else if (file.fieldname === 'cvFile') {
            cb(null, 'uploads/cvs/');
        } else {
            cb(null, 'uploads/');
        }
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        // Allow images and PDFs
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

// Upload profile picture
router.post('/profile-picture', verifyToken, uploadLimiter, upload.single('profilePicture'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No file uploaded'
            });
        }

        const fileUrl = `/uploads/profiles/${req.file.filename}`;
        res.json({
            success: true,
            message: 'File uploaded successfully',
            fileUrl
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({
            success: false,
            error: 'File upload failed'
        });
    }
});

// Upload CV file
router.post('/cv/:cvId', verifyToken, uploadLimiter, upload.single('cvFile'), uploadCVFile);

// Legacy CV upload (without ID - just returns URL)
router.post('/cv', verifyToken, uploadLimiter, upload.single('cvFile'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No file uploaded'
            });
        }

        const fileUrl = `/uploads/cvs/${req.file.filename}`;
        res.json({
            success: true,
            message: 'CV uploaded successfully',
            fileUrl
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({
            success: false,
            error: 'CV upload failed'
        });
    }
});

module.exports = router;