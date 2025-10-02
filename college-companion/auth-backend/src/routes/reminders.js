import express from "express";
import authenticateToken from '../middleware/auth.js'; 
// !!! IMPORTANT: Adjust this path to match your actual database connection file !!!
import db from '../db.js'; 

const router = express.Router();

// ----------------------------------------------------------------------
// GET /api/reminders
// Fetches reminders, applying filtering based on user role and query parameters.
// ----------------------------------------------------------------------
router.get("/", authenticateToken, async (req, res) => {
    // 1. Get user context from query (passed by React frontend)
    const { role, department, division } = req.query; 

    try {
        let query = '';
        let values = [];

        if (role === 'staff' || role === 'admin') {
            // Staff/Admin view: Get all reminders
            query = 'SELECT * FROM reminders ORDER BY date DESC, department ASC;';
        } else {
            // Student view: Filter by ALL, their specific Department/ALL, or their specific Department/Division
            // $1 = user's department, $2 = user's division
            query = `
                SELECT * FROM reminders
                WHERE department = 'ALL' 
                   OR (department = $1 AND division = 'ALL')
                   OR (department = $1 AND division = $2)
                ORDER BY date DESC, department ASC;
            `;
            values = [department, division];
        }

        const result = await db.query(query, values);
        // Returns the filtered list of reminders
        res.json(result.rows); 

    } catch (err) {
        console.error('Error fetching reminders:', err);
        // Respond with a 500 error if the database query fails
        res.status(500).json({ message: 'Internal Server Error while fetching reminders.' });
    }
});


// ----------------------------------------------------------------------
// POST /api/reminders
// Adds a new reminder (staff/admin only).
// ----------------------------------------------------------------------
router.post("/", authenticateToken, async (req, res) => {
    const { title, date, note, department, division } = req.body;
    
    // 1. Authorization Check: Only staff/admin can create reminders.
    // Assuming authenticateToken middleware attaches user data to req.user
    if (req.user.role !== 'staff' && req.user.role !== 'admin') {
        return res.status(403).json({ message: "Forbidden. Only staff or admin can create reminders." });
    }

    // 2. Data Validation (Basic)
    if (!title || !date || !department || !division) {
        return res.status(400).json({ message: "Missing required fields (title, date, department, division)." });
    }

    try {
        const query = `
            INSERT INTO reminders (title, date, note, department, division) 
            VALUES ($1, $2, $3, $4, $5) 
            RETURNING *;
        `;
        // Ensure values match the order of columns in the query
        const values = [title, date, note || null, department, division];
        
        const result = await db.query(query, values);

        // 3. Success: Return the newly created reminder object with its ID
        res.status(201).json(result.rows[0]); 

    } catch (err) {
        console.error('Error saving new reminder:', err);
        res.status(500).json({ message: 'Internal Server Error while saving reminder.' });
    }
});

export default router;
