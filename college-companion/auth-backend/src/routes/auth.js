import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { query } from "../db.js";

const router = express.Router();
const ALLOWED_ROLES = new Set(["student", "staff", "admin"]);
const isEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

// ✅ REGISTER
router.post("/register", async (req, res) => {
    console.log("Incoming body:", req.body);

    try {
        const { username, email, password, role = "student", department, contact_no } = req.body;

        // ---- input validation
        if (!username || !email || !password || !contact_no) {
            return res.status(400).json({ message: "username, email, password and contact_no are required" });
        }
        if (!isEmail(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }
        if (!ALLOWED_ROLES.has(role)) {
            return res.status(400).json({ message: "Invalid role" });
        }

        // ---- check duplicates
        const dupe = await query(
            "SELECT 1 FROM users WHERE email=$1 OR username=$2",
            [email, username]
        );
        if (dupe.rows.length) {
            return res.status(409).json({ message: "Username or email already exists" });
        }
        
        // --- 🎯 CORE FIX: LOOK UP DEPARTMENT ID ---
        let finalDeptId = null;

        if (role !== "admin" && department) {
            // Query the departments table to get the numeric ID from the code ('INFT')
            const deptResult = await query(
                "SELECT dept_id FROM departments WHERE dept_name = $1",
                [department]
            );

            if (deptResult.rows.length === 0) {
                // Handle case where department code is not found
                return res.status(400).json({ 
                    message: `Invalid department code: ${department}. Please use an allowed code.` 
                });
            }
            
            // Assign the numeric ID to be used in the users table insert
            finalDeptId = deptResult.rows[0].id; 
        }
        // -------------------------------------------

        // ---- hash and insert
        const hashedPassword = await bcrypt.hash(password, 10);

        const insertSql = `
            INSERT INTO users (username, email, password, role, dept_id, contact_no)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING user_id, username, email, role, dept_id, contact_no
        `;

        const { rows } = await query(insertSql, [
            username,
            email,
            hashedPassword,
            role,
            finalDeptId, // <--- This now correctly passes a numeric ID or null
            contact_no,
        ]);

        return res.status(201).json({
            message: "User registered successfully",
            user: rows[0],
        });
    } catch (err) {
        // handle PG unique violation nicely
        if (err?.code === "23505") {
            return res.status(409).json({ message: "Username or email already exists" });
        }
        // Log the error for debugging
        console.error("Register error:", err.message, err.detail, err.stack);

        return res.status(500).json({ message: "Server error" });
    }
});


// ✅ LOGIN

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // basic validation
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        // fetch user by email
        const userResult = await query("SELECT user_id, username, email, password, role FROM users WHERE email = $1", [email]);
        if (userResult.rows.length === 0) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const user = userResult.rows[0];

        // compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        // generate token payload
        const payload = {
            user_id: user.user_id,
            username: user.username,
            role: user.role,
        };

        // sign JWT
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "4h" });

        // optional: send user info (without password)
        const userResponse = {
            user_id: user.user_id,
            username: user.username,
            email: user.email,
            role: user.role,
        };

        return res.json({ message: "Login successful", token, user: userResponse });
    } catch (err) {
        console.error("Login error:", err);
        return res.status(500).json({ message: "Server error" });
    }
});

export default router;