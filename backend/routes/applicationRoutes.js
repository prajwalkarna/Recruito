const express = require('express');
const router = express.Router();
const {
    applyToJob,
    getMyApplications,
    getApplicationById,
    withdrawApplication,
    checkAlreadyApplied,
    getJobApplicants,
    updateApplicationStatus,
    bulkUpdateStatus,
    getApplicantDetails
} = require('../controllers/applicationController');
const { verifyToken } = require('../middleware/authMiddleware');
const { validateApplication, validateId, validateJobId } = require('../middleware/validators');

// All routes require authentication
router.post('/', verifyToken, validateApplication, applyToJob);
router.post('/bulk-status', verifyToken, bulkUpdateStatus);

// Freelancer routes
router.get('/me', verifyToken, getMyApplications);                        // FIX: was /my-applications, frontend calls /me
router.get('/check/:jobId', verifyToken, checkAlreadyApplied);            // FIX: was missing

// Employer routes
router.get('/job/:jobId/applicants', verifyToken, validateJobId, getJobApplicants);
router.get('/:applicationId/details', verifyToken, getApplicantDetails); // FIX: match frontend /:id/details
router.put('/:id/status', verifyToken, validateId, updateApplicationStatus);

// Shared
router.get('/:id', verifyToken, validateId, getApplicationById);           // FIX: was missing
router.delete('/:id', verifyToken, validateId, withdrawApplication);

module.exports = router;
