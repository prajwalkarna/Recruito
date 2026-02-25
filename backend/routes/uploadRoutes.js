const express = require('express');
const router = express.Router();
const { uploadProfile, uploadCV, uploadPortfolio } = require('../config/multer');
const { verifyToken } = require('../middleware/authMiddleware');
const {
    uploadProfilePicture,
    uploadCVFile,
    uploadPortfolioFile,
    deleteFile
} = require('../controllers/uploadController');

// Profile picture upload
router.post('/profile-picture', verifyToken, uploadProfile.single('profilePicture'), uploadProfilePicture);

// CV file upload
router.post('/cv/:cvId', verifyToken, uploadCV.single('cvFile'), uploadCVFile);

// Portfolio file upload
router.post('/portfolio', verifyToken, uploadPortfolio.single('portfolioFile'), uploadPortfolioFile);

// Delete file
router.delete('/:type/:id', verifyToken, deleteFile);

module.exports = router;