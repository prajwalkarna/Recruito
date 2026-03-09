const express = require('express');
const router = express.Router();
const { verifyToken, checkRole } = require('../middleware/authMiddleware');
const {
    createCV,
    getMyCVs,
    getCVById,
    updateCV,
    deleteCV,
    setDefaultCV,
} = require('../controllers/cvController');

// All CV routes are protected — must be logged in as freelancer
// GET    /api/cvs/me        → all CVs of logged-in user
// GET    /api/cvs/:id       → single CV (owner only)
// POST   /api/cvs           → create new CV
// PUT    /api/cvs/:id       → update CV
// PATCH  /api/cvs/:id/set-default → mark as default
// DELETE /api/cvs/:id       → delete CV

router.get('/me', verifyToken, checkRole(['freelancer', 'admin']), getMyCVs);
router.get('/:id', verifyToken, getCVById);
router.post('/', verifyToken, checkRole(['freelancer']), createCV);
router.put('/:id', verifyToken, checkRole(['freelancer']), updateCV);
router.patch('/:id/set-default', verifyToken, checkRole(['freelancer']), setDefaultCV);
router.delete('/:id', verifyToken, checkRole(['freelancer', 'admin']), deleteCV);

module.exports = router;