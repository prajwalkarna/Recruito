const express = require('express');
const router = express.Router();
const {
    createJob,
    getAllJobs,
    getJobById,
    updateJob,
    deleteJob,
    getMyJobs,
    getCategories,
    searchJobs,
    getFilterOptions
} = require('../controllers/jobController');
const { verifyToken } = require('../middleware/authMiddleware');
const { validateJob, validateId, validatePagination } = require('../middleware/validators');

// Public routes
router.get('/categories', getCategories);
router.get('/search', validatePagination, searchJobs);
router.get('/filter-options', getFilterOptions);
router.get('/', validatePagination, getAllJobs);
router.get('/:id', validateId, getJobById);

// Protected routes
router.post('/', verifyToken, validateJob, createJob);
router.put('/:id', verifyToken, validateId, validateJob, updateJob);
router.delete('/:id', verifyToken, validateId, deleteJob);
router.get('/employer/my-jobs', verifyToken, getMyJobs);

module.exports = router;
