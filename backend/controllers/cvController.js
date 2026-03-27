const db = require('../db');

// ─── CREATE CV ────────────────────────────────────────────────
const createCV = async (req, res) => {
    const user_id = req.user.id;
    const {
        title,
        full_name,
        email,
        phone,
        summary,
        skills,
        experience,
        education,
        certifications,
        languages,
        is_default,
    } = req.body;

    if (!full_name) {
        return res.status(400).json({ message: 'Full name is required.' });
    }

    try {
        // If this is set as default, unset all others first
        if (is_default) {
            await db.query(
                'UPDATE cvs SET is_default = FALSE WHERE user_id = $1',
                [user_id]
            );
        }

        const result = await db.query(
            `INSERT INTO cvs
                (user_id, title, full_name, email, phone, summary, skills, experience, education, certifications, languages, is_default)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
             RETURNING *`,
            [
                user_id,
                title || 'My CV',
                full_name,
                email || null,
                phone || null,
                summary || null,
                skills ? JSON.stringify(skills) : '[]',
                experience ? JSON.stringify(experience) : '[]',
                education ? JSON.stringify(education) : '[]',
                certifications ? JSON.stringify(certifications) : '[]',
                languages ? JSON.stringify(languages) : '[]',
                is_default || false,
            ]
        );

        res.status(201).json({ message: 'CV created successfully.', cv: result.rows[0] });
    } catch (err) {
        console.error('createCV error:', err);
        res.status(500).json({ message: 'Server error while creating CV.' });
    }
};

// ─── GET ALL CVs BY LOGGED-IN USER ───────────────────────────
const getMyCVs = async (req, res) => {
    const user_id = req.user.id;

    try {
        const result = await db.query(
            `SELECT id, title, full_name, email, is_default, created_at, updated_at
             FROM cvs
             WHERE user_id = $1
             ORDER BY is_default DESC, updated_at DESC`,
            [user_id]
        );

        res.json({ cvs: result.rows });
    } catch (err) {
        console.error('getMyCVs error:', err);
        res.status(500).json({ message: 'Server error while fetching CVs.' });
    }
};

// ─── GET SINGLE CV BY ID ─────────────────────────────────────
const getCVById = async (req, res) => {
    const { id } = req.params;
    const user_id = req.user.id;

    try {
        const result = await db.query(
            'SELECT * FROM cvs WHERE id = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'CV not found.' });
        }

        const cv = result.rows[0];

        // Only owner or admin can view
        if (cv.user_id !== user_id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied.' });
        }

        res.json({ cv });
    } catch (err) {
        console.error('getCVById error:', err);
        res.status(500).json({ message: 'Server error while fetching CV.' });
    }
};

// ─── UPDATE CV ────────────────────────────────────────────────
const updateCV = async (req, res) => {
    const { id } = req.params;
    const user_id = req.user.id;
    const {
        title,
        full_name,
        email,
        phone,
        summary,
        skills,
        experience,
        education,
        certifications,
        languages,
        is_default,
    } = req.body;

    try {
        const existing = await db.query('SELECT * FROM cvs WHERE id = $1', [id]);

        if (existing.rows.length === 0) {
            return res.status(404).json({ message: 'CV not found.' });
        }

        if (existing.rows[0].user_id !== user_id) {
            return res.status(403).json({ message: 'You can only edit your own CVs.' });
        }

        // If setting as default, clear others
        if (is_default) {
            await db.query(
                'UPDATE cvs SET is_default = FALSE WHERE user_id = $1',
                [user_id]
            );
        }

        const result = await db.query(
            `UPDATE cvs SET
                title          = COALESCE($1, title),
                full_name      = COALESCE($2, full_name),
                email          = COALESCE($3, email),
                phone          = COALESCE($4, phone),
                summary        = COALESCE($5, summary),
                skills         = COALESCE($6, skills),
                experience     = COALESCE($7, experience),
                education      = COALESCE($8, education),
                certifications = COALESCE($9, certifications),
                languages      = COALESCE($10, languages),
                is_default     = COALESCE($11, is_default),
                updated_at     = CURRENT_TIMESTAMP
             WHERE id = $12
             RETURNING *`,
            [
                title || null,
                full_name || null,
                email || null,
                phone || null,
                summary || null,
                skills ? JSON.stringify(skills) : null,
                experience ? JSON.stringify(experience) : null,
                education ? JSON.stringify(education) : null,
                certifications ? JSON.stringify(certifications) : null,
                languages ? JSON.stringify(languages) : null,
                is_default !== undefined ? is_default : null,
                id,
            ]
        );

        res.json({ message: 'CV updated successfully.', cv: result.rows[0] });
    } catch (err) {
        console.error('updateCV error:', err);
        res.status(500).json({ message: 'Server error while updating CV.' });
    }
};

// ─── DELETE CV ────────────────────────────────────────────────
const deleteCV = async (req, res) => {
    const { id } = req.params;
    const user_id = req.user.id;

    try {
        const existing = await db.query('SELECT * FROM cvs WHERE id = $1', [id]);

        if (existing.rows.length === 0) {
            return res.status(404).json({ message: 'CV not found.' });
        }

        if (existing.rows[0].user_id !== user_id) {
            return res.status(403).json({ message: 'You can only delete your own CVs.' });
        }

        await db.query('DELETE FROM cvs WHERE id = $1', [id]);

        res.json({ message: 'CV deleted successfully.' });
    } catch (err) {
        console.error('deleteCV error:', err);
        res.status(500).json({ message: 'Server error while deleting CV.' });
    }
};

// ─── SET DEFAULT CV ───────────────────────────────────────────
const setDefaultCV = async (req, res) => {
    const { id } = req.params;
    const user_id = req.user.id;

    try {
        const existing = await db.query('SELECT * FROM cvs WHERE id = $1', [id]);

        if (existing.rows.length === 0) {
            return res.status(404).json({ message: 'CV not found.' });
        }

        if (existing.rows[0].user_id !== user_id) {
            return res.status(403).json({ message: 'Access denied.' });
        }

        // Clear all defaults then set this one
        await db.query('UPDATE cvs SET is_default = FALSE WHERE user_id = $1', [user_id]);
        await db.query('UPDATE cvs SET is_default = TRUE WHERE id = $1', [id]);

        res.json({ message: 'Default CV updated.' });
    } catch (err) {
        console.error('setDefaultCV error:', err);
        res.status(500).json({ message: 'Server error while setting default CV.' });
    }
};

module.exports = { createCV, getMyCVs, getCVById, updateCV, deleteCV, setDefaultCV };