import express from 'express';

// Export the router factory function that accepts the PostgreSQL pool.
export default (pool) => {
    // 1. Initialize the router inside the function so it's fresh for the app.use call.
    const router = express.Router();

    // GET /api/internships - Fetch All Internships
    router.get('/', async (req, res) => {
        try {
            // 'pool' is now correctly accessible here from the function argument.
            const result = await pool.query('SELECT * FROM internship ORDER BY applicationdeadline DESC');
            res.status(200).json(result.rows);
        } catch (err) {
            console.error("Database Error fetching internships:", err);
            res.status(500).json({ message: "Server error fetching data." });
        }
    });

    // POST /api/internships - Add a New Internship
    router.post('/', async (req, res) => {
        const { companyname, jobtitle, description, stipend, applicationdeadline, status, nextinterviewdate } = req.body;
        
        if (!companyname || !jobtitle || !applicationdeadline) {
            return res.status(400).json({ message: 'Missing mandatory fields.' });
        }
        
        const query = `
            INSERT INTO internship (companyname, jobtitle, description, stipend, applicationdeadline, status, nextinterviewdate)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *;
        `;
        const values = [companyname, jobtitle, description, stipend, applicationdeadline, status, nextinterviewdate];

        try {
            const result = await pool.query(query, values);
            res.status(201).json(result.rows[0]); 
        } catch (err) {
            console.error("Database Error inserting internship:", err);
            res.status(500).json({ message: "Failed to create application." });
        }
    });
    
    // You'll add PUT/DELETE routes here later.

    // 2. IMPORTANT: Return the router instance.
    return router;
};
