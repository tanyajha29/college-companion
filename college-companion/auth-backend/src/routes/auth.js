import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool, { query } from "../db.js";

const router = express.Router();
const ALLOWED_ROLES = new Set(["student", "faculty", "staff", "admin"]);
const isEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

// ✅ REGISTER
router.post("/register", async (req, res) => {
    console.log("Incoming body:", req.body);

    const {
        username, email, password, role = "student", contact_no,
        departmentId, rollNumber, yearOfStudy, division, designation
    } = req.body;

    // Use safe parsing for numeric IDs
    const deptId = departmentId ? parseInt(departmentId) : NaN; 
    const normalizedRole = role.toLowerCase();

    // 1. BASIC INPUT AND ROLE VALIDATION
    if (!username || !email || !password || !contact_no) {
        return res.status(400).json({ message: "username, email, password, and contact_no are required" });
    }
    if (!isEmail(email)) {
        return res.status(400).json({ message: "Invalid email format" });
    }
    if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
    }
    if (!ALLOWED_ROLES.has(normalizedRole)) {
        return res.status(400).json({ message: `Invalid role. Allowed roles are: ${[...ALLOWED_ROLED].join(', ')}` });
    }

    // 2. ROLE-SPECIFIC FIELD REQUIREMENTS
    // Note: Staff/Faculty are treated as the 'Faculty' DB role, which typically requires a department.
    const requiresDepartment = normalizedRole !== 'admin';

    if (requiresDepartment && isNaN(deptId)) {
        return res.status(400).json({ message: "Department ID is required for Students, Faculty, and Staff." });
    }
    
    if (normalizedRole === 'student' && (!rollNumber || !yearOfStudy || !division)) {
        return res.status(400).json({ message: "Student registration requires Roll Number, Year, and Division." });
    }
    
    // Default designation if not provided for staff/faculty
    let facultyDesignation = designation || (normalizedRole === 'staff' || normalizedRole === 'faculty' ? "Pending Assignment" : null);

    try {
        // --- Check Duplicates
        const dupe = await pool.query(
            'SELECT 1 FROM "USER" WHERE email=$1 OR username=$2',
            [email, username]
        );
        if (dupe.rows.length) {
            return res.status(409).json({ message: "Username or email already exists" });
        }

        // --- 3. DATABASE VALIDATION CHECKS (NEW ADDITIONS)
        
        if (requiresDepartment) {
            // Check if departmentId is valid
            const deptCheck = await pool.query('SELECT 1 FROM department WHERE departmentid = $1', [deptId]);
            if (deptCheck.rows.length === 0) {
                return res.status(400).json({ message: `Invalid Department ID: ${deptId}. Department does not exist.` });
            }
        }

        if (normalizedRole === 'student') {
            // Check if the division is valid for the given department
            const divisionResult = await pool.query(
                'SELECT divisionid FROM division WHERE departmentid = $1 AND divisionname = $2',
                [deptId, division]
            );

            if (divisionResult.rows.length === 0) {
                return res.status(400).json({ message: `Invalid Division: ${division} is not configured for Department ID: ${deptId}.` });
            }
            // Store divisionId for later use
            req.body.divisionId = divisionResult.rows[0].divisionid;
        }

        // --- START TRANSACTION ---
        await pool.query('BEGIN');
        
        // Determine the final database role (e.g., 'staff' -> 'Faculty')
        let dbRole = normalizedRole.charAt(0).toUpperCase() + normalizedRole.slice(1);
        if (normalizedRole === 'staff' || normalizedRole === 'faculty') {
            dbRole = 'Faculty';
        }
        
        // 4. INSERT INTO "USER" TABLE
        const hashedPassword = await bcrypt.hash(password, 10);
        const userInsertSql = 'INSERT INTO "USER" (username, email, passwordhash, "Role", contact_no) VALUES ($1, $2, $3, $4, $5) RETURNING userid';

        const userResult = await pool.query(userInsertSql, [
            username, email, hashedPassword, dbRole, contact_no
        ]);
        const userId = userResult.rows[0].userid;

        // 5. CONDITIONAL INSERTION into specific tables
        if (dbRole === 'Student') {
            // Use the divisionId saved from the validation step
            await pool.query(
                'INSERT INTO student (userid, divisionid, rollnumber, yearofstudy) VALUES ($1, $2, $3, $4)',
                [userId, req.body.divisionId, rollNumber, yearOfStudy]
            );
        } else if (dbRole === 'Faculty') {
            await pool.query(
                'INSERT INTO faculty (userid, departmentid, designation, name, email) VALUES ($1, $2, $3, $4, $5)',
                [userId, deptId, facultyDesignation, username, email]
            );
        } else if (dbRole === 'Admin') {
            await pool.query(
                'INSERT INTO admin (userid, name, email) VALUES ($1, $2, $3)',
                [userId, username, email]
            );
        }

        // --- COMMIT TRANSACTION ---
        await pool.query('COMMIT');

        return res.status(201).json({
            message: "User registered successfully",
            user: { userId, role: dbRole, email, contact: contact_no }
        });

    } catch (err) {
        await pool.query('ROLLBACK');

        // Check for unique constraint violation explicitly
        if (err?.code === "23505") {
            return res.status(409).json({ message: "Username or email already exists" });
        }
        console.error("Register transaction error:", err.message, err.detail, err.stack);
        return res.status(500).json({ message: "Server error during registration." });
    }
});


// ✅ LOGIN (Unchanged)
router.post("/login", async (req, res) => {
    // ... (Your existing, correct login logic)
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const userResult = await query('SELECT userid, username, email, passwordhash, "Role" FROM "USER" WHERE email = $1', [email]);
        if (userResult.rows.length === 0) {
            return res.status(400).json({ message: "Invalid email or password" });
        }
        const user = userResult.rows[0];

        const isMatch = await bcrypt.compare(password, user.passwordhash);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const payload = {
            userId: user.userid,
            username: user.username,
            role: user.Role.toLowerCase(),
        };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "4h" });
        
        const userResponse = {
            userId: user.userid,
            username: user.username,
            email: user.email,
            role: user.Role, // Send the original case (e.g., "Faculty") to the UI
        };

        return res.json({ message: "Login successful", token, user: userResponse });
    } catch (err) {
        console.error("Login error:", err);
        return res.status(500).json({ message: "Server error" });
    }
});


export default router;