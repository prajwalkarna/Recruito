const express = require('express');
const router = express.Router();
const {
    saveJob,
    getSavedJobs,
    unsaveJob,
    checkIfSaved
} = require('../controllers/savedJobController');
const { verifyToken } = require('../middleware/authMiddleware');
const { validateJobId_snake } = require('../middleware/validators');

// All routes require authentication
router.post('/', verifyToken, saveJob);
router.get('/', verifyToken, getSavedJobs);
router.delete('/:job_id', verifyToken, validateJobId_snake, unsaveJob);
router.get('/check/:job_id', verifyToken, validateJobId_snake, checkIfSaved);

module.exports = router;