import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
// Note: We use the default pool for transactions, not the exported query function
import pool, { query } from "../db.js";

const router = express.Router();
const ALLOWED_ROLES = new Set(["student", "faculty", "admin"]);
const isEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

// ✅ REGISTER
router.post("/register", async (req, res) => {
    console.log("Incoming body:", req.body);

    const {
        username, email, password, role = "student", contact_no,
        departmentId, rollNumber, yearOfStudy, division, designation
    } = req.body;

    const deptId = parseInt(departmentId);
    const normalizedRole = role.toLowerCase();

    // 1. INPUT VALIDATION (No changes)
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
        return res.status(400).json({ message: "Invalid role" });
    }

    // 2. ROLE-SPECIFIC VALIDATION (No changes)
    if (normalizedRole === 'student' && (!rollNumber || !yearOfStudy || !division || isNaN(deptId))) {
        return res.status(400).json({ message: "Student registration requires Roll Number, Year, Division, and Department." });
    }
   let facultyDesignation = designation; 
    if ((normalizedRole === 'staff' || normalizedRole === 'admin') && !designation) {
    // Assign a default value when the UI field is missing
    facultyDesignation = "Pending Assignment"; 
    console.log("Designation defaulted to:", facultyDesignation);
}
    if (normalizedRole !== 'admin' && isNaN(deptId)) {
        return res.status(400).json({ message: "Department is required for Students/Staff." });
    }


    try {
        // --- Check Duplicates
        const dupe = await pool.query(
            'SELECT 1 FROM "USER" WHERE email=$1 OR username=$2', // Table name changed to "user" (lowercase and unquoted will be treated as lowercase)
            [email, username]
        );
        if (dupe.rows.length) {
            return res.status(409).json({ message: "Username or email already exists" });
        }

        // --- START TRANSACTION ---
        await pool.query('BEGIN');

        // Map normalized role to DB casing (student, faculty, admin)
        // NOTE: We are using the lowercase role in the database, but keeping the logic below for clarity/consistency with app logic.
        let dbRole =  normalizedRole.charAt(0).toUpperCase() + normalizedRole.slice(1); // Using normalizedRole for db (e.g., 'student') for lowercase consistency.
        if (dbRole === 'Staff') {
            dbRole = 'Faculty'; // Mapping 'staff' input to 'faculty' in DB
        }

        // 3. INSERT INTO "user" TABLE
        const hashedPassword = await bcrypt.hash(password, 10);

        // 🎯 FIX: Changed 'passwordHash' to 'passwordhash', 'contactno' is already lowercase, 'userId' to 'userid', and "Role" to "role"
        const userInsertSql = 'INSERT INTO "USER" (username, email, passwordhash, "Role", contact_no) VALUES ($1, $2, $3, $4, $5) RETURNING userid';


        const userResult = await pool.query(userInsertSql, [
            username, email, hashedPassword, dbRole, contact_no
        ]);
        // 🎯 FIX: Retrieve lowercase 'userid'
        const userId = userResult.rows[0].userid;


        // 4. CONDITIONAL INSERTION into specific tables (using dbRole)
        if (dbRole === 'student') {

            // Step 4a: Look up divisionid
            const divisionResult = await pool.query(
                // 🎯 FIX: Changed columns to 'departmentid', 'divisionname', 'divisionid' (all lowercase)
                'SELECT divisionid FROM division WHERE departmentid = $1 AND divisionname = $2',
                [deptId, division]
            );

            if (divisionResult.rows.length === 0) {
                await pool.query('ROLLBACK');
                return res.status(400).json({ message: `Invalid Division: ${division} for Department ID: ${deptId}.` });
            }
            // 🎯 FIX: Retrieved lowercase 'divisionid'
            const divisionId = divisionResult.rows[0].divisionid;

            // Step 4b: Insert into student table
            await pool.query(
                // 🎯 FIX: Changed columns to 'userid', 'divisionid', 'rollnumber', 'yearofstudy' (all lowercase)
                'INSERT INTO student (userid, divisionid, rollnumber, yearofstudy) VALUES ($1, $2, $3, $4)',
                [userId, divisionId, rollNumber, yearOfStudy]
            );

        } else if (dbRole === 'faculty') {
            // Insert into faculty table
            await pool.query(
                // 🎯 FIX: Changed columns to 'userid', 'departmentid', 'designation' (all lowercase)
                'INSERT INTO faculty (userid, departmentid, designation) VALUES ($1, $2, $3)',
                [userId, deptId, facultyDesignation]
            );
        } else if (dbRole === 'admin') {
            // Insert into admin table
            await pool.query(
                // 🎯 FIX: Changed column to 'userid' (all lowercase)
                'INSERT INTO admin (userid, name, email) VALUES ($1, $2, $3)',
                [userId, username, email]
            );
        }


        // --- COMMIT TRANSACTION ---
        await pool.query('COMMIT');

        return res.status(201).json({
            message: "User registered successfully",
            // The JSON response keys are kept camelCase for JS convention
            user: { userId, role: dbRole, email, contact: contact_no }
        });

    } catch (err) {
        // --- ROLLBACK TRANSACTION on error ---
        await pool.query('ROLLBACK');

        // Handle PG unique violation nicely
        if (err?.code === "23505") {
            return res.status(409).json({ message: "Username or email already exists" });
        }

        // Log the error for debugging
        console.error("Register transaction error:", err.message, err.detail, err.stack);

        // General 500 status for unknown database or server error
        return res.status(500).json({ message: "Server error during registration." });
    }
});

// ---

// ✅ LOGIN

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // basic validation
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        // fetch user by email
        // 🎯 FIX: Changed columns to 'userid' and 'passwordhash', and "Role" to "role" (all lowercase)
        const userResult = await query('SELECT userid, username, email, passwordhash, "Role" FROM "USER" WHERE email = $1', [email]);
        if (userResult.rows.length === 0) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const user = userResult.rows[0];

        // compare password (retrieved as lowercase passwordhash)
        // 🎯 FIX: Changed key from 'passwordHash' to 'passwordhash'
        const isMatch = await bcrypt.compare(password, user.passwordhash);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        // generate token payload
        const payload = {
            // 🎯 FIX: Changed key from 'userId' to 'userid'
            userId: user.userid,
            username: user.username,
            // 🎯 FIX: Changed key from 'Role' to 'role'
            role: user.Role,
        };

        // sign JWT
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "4h" });

        // optional: send user info
        const userResponse = {
            // 🎯 FIX: Changed key from 'userId' to 'userid'
            userId: user.userid,
            username: user.username,
            email: user.email,
            // 🎯 FIX: Changed key from 'Role' to 'role'
            role: user.Role,
        };

        return res.json({ message: "Login successful", token, user: userResponse });
    } catch (err) {
        console.error("Login error:", err);
        return res.status(500).json({ message: "Server error" });
    }
});

export default router;