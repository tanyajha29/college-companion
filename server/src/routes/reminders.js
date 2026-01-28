import express from "express";
import authenticateToken from '../middleware/auth.js';
import db from '../db.js';

const router = express.Router();

// --- GET /api/reminders ---
// Fetches reminders based on the user's role and context.
router.get("/", authenticateToken, async (req, res) => {
    // User context is passed from the frontend as query parameters
    const { role, department, division } = req.query;

    try {
        let queryText = '';
        let queryParams = [];

        if (role === 'staff' || role === 'admin') {
            // Staff/Admins see all reminders
            queryText = 'SELECT * FROM reminders ORDER BY date DESC;';
        } else {
            // Students see reminders for 'ALL' or their specific department/division
            queryText = `
                SELECT * FROM reminders
                WHERE 
                    department = 'ALL' OR
                    (department = $1 AND division = 'ALL') OR
                    (department = $1 AND division = $2)
                ORDER BY date DESC;
            `;
            queryParams = [department, division];
        }

        const result = await db.query(queryText, queryParams);
        res.json(result.rows);

    } catch (err) {
        console.error('Error fetching reminders:', err);
        res.status(500).json({ message: 'Server error while fetching reminders.' });
    }
});

// --- POST /api/reminders ---
// Creates a new reminder. Restricted to staff and admins.
router.post("/", authenticateToken, async (req, res) => {
    const { title, date, note, department, division } = req.body;
    const creatorUserId = req.user.userId; // Get the user ID from the token

    // Authorization: only staff/admin can create
    if (req.user.role !== 'staff' && req.user.role !== 'admin') {
        return res.status(403).json({ message: "Forbidden: You do not have permission to create reminders." });
    }

    // Validation
    if (!title || !date || !department || !division) {
        return res.status(400).json({ message: "Title, date, department, and division are required fields." });
    }

    try {
        const queryText = `
            INSERT INTO reminders (title, date, note, department, division, userid) 
            VALUES ($1, $2, $3, $4, $5, $6) 
            RETURNING *;
        `;
        const queryParams = [title, date, note || null, department, division, creatorUserId];
        
        const result = await db.query(queryText, queryParams);
        res.status(201).json(result.rows[0]); // Return the full new reminder object

    } catch (err) {
        console.error('Error saving new reminder:', err);
        res.status(500).json({ message: 'Server error while saving reminder.' });
    }
});

// --- DELETE /api/reminders/:id ---
// Deletes a reminder. Restricted to staff and admins.
router.delete("/:id", authenticateToken, async (req, res) => {
    const { id } = req.params;

    // Authorization: only staff/admin can delete
    if (req.user.role !== 'staff' && req.user.role !== 'admin') {
        return res.status(403).json({ message: "Forbidden: You do not have permission to delete reminders." });
    }

    try {
        const result = await db.query('DELETE FROM reminders WHERE id = $1 RETURNING *;', [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Reminder not found." });
        }
        
        res.status(200).json({ message: "Reminder deleted successfully." });

    } catch (err) {
        console.error(`Error deleting reminder with id ${id}:`, err);
        res.status(500).json({ message: 'Server error while deleting reminder.' });
    }
});

export default router;