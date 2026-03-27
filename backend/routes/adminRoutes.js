const express = require('express');
const router = express.Router();
const {
    checkAdmin,
    getAllUsers,
    getUserById,
    toggleUserStatus,
    deleteUser,
    getAdminStats,
    bulkUserAction,
    getAllJobs,
    getJobById,
    updateJobStatus,
    deleteJob,
    getJobStats,
    bulkJobAction,
} = require('../controllers/adminController');
const { verifyToken } = require('../middleware/authMiddleware');

// Apply admin check to all routes
router.use(verifyToken, checkAdmin);

// Statistics
router.get('/stats', getAdminStats);

// User management
router.get("/users", getAllUsers);
router.get("/users/:id", getUserById);
router.patch("/users/:id/toggle-status", toggleUserStatus);
router.delete("/users/:id", deleteUser);
router.post("/users/bulk-action", bulkUserAction);

// Job management
router.get("/jobs", getAllJobs);
router.get("/jobs/stats", getJobStats);
router.get("/jobs/:id", getJobById);
router.patch("/jobs/:id/status", updateJobStatus);
router.delete("/jobs/:id", deleteJob);
router.post("/jobs/bulk-action", bulkJobAction);

module.exports = router;