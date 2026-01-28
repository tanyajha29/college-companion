import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool, { query } from "../db.js";
import { sendOTPEmail } from "../services/emailService.js";

const ALLOWED_ROLES = new Set(["student", "faculty", "staff", "admin"]);
const isEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

/**
 * Generate a 6-digit OTP
 * @returns {string} - 6-digit OTP
 */
export const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

/**
 * Hash OTP using bcrypt
 * @param {string} otp - Plain OTP to hash
 * @returns {Promise<string>} - Hashed OTP
 */
export const hashOTP = async (otp) => {
  return bcrypt.hash(otp, 10);
};

/**
 * Verify OTP against hash
 * @param {string} otp - Plain OTP
 * @param {string} hash - Hashed OTP
 * @returns {Promise<boolean>} - True if OTP matches
 */
export const verifyOTPHash = async (otp, hash) => {
  return bcrypt.compare(otp, hash);
};

/**
 * Handle login and generate OTP
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const handleLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    if (!isEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Check if user exists and password matches
    const userResult = await query(
      'SELECT userid, username, email, passwordhash, "Role" FROM "USER" WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const user = userResult.rows[0];
    const isMatch = await bcrypt.compare(password, user.passwordhash);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpHash = await hashOTP(otp);

    // Set expiry to 10 minutes from now
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Delete any existing OTP for this email
    await query("DELETE FROM otp_store WHERE email = $1", [email]);

    // Store OTP hash in database
    await query(
      "INSERT INTO otp_store (email, otp_hash, expires_at) VALUES ($1, $2, $3)",
      [email, otpHash, expiresAt]
    );

    // Send OTP via email
    const emailSent = await sendOTPEmail(email, otp);

    if (!emailSent) {
      return res.status(500).json({
        message: "Failed to send OTP. Please try again later.",
      });
    }

    // Return success with user info (no token yet)
    return res.status(200).json({
      message: "OTP sent successfully to your email",
      email: email,
      userId: user.userid,
      username: user.username,
      role: user.Role,
      expiresIn: 600, // 10 minutes in seconds
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Server error during login" });
  }
};

/**
 * Handle OTP verification and JWT issuance
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const handleVerifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Validate input
    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    if (!isEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (otp.length !== 6 || isNaN(otp)) {
      return res.status(400).json({ message: "Invalid OTP format" });
    }

    // Check rate limiting (max 5 attempts per OTP session)
    const otpRecord = await query(
      "SELECT otp_hash, expires_at, attempts FROM otp_store WHERE email = $1",
      [email]
    );

    if (otpRecord.rows.length === 0) {
      return res.status(400).json({
        message: "No OTP found for this email. Please request a new one.",
      });
    }

    const { otp_hash, expires_at, attempts } = otpRecord.rows[0];

    // Check if OTP has expired
    if (new Date() > new Date(expires_at)) {
      await query("DELETE FROM otp_store WHERE email = $1", [email]);
      return res.status(400).json({
        message: "OTP has expired. Please request a new one.",
      });
    }

    // Check attempt limit
    if (attempts >= 5) {
      await query("DELETE FROM otp_store WHERE email = $1", [email]);
      return res.status(429).json({
        message: "Maximum OTP attempts exceeded. Please request a new OTP.",
      });
    }

    // Verify OTP
    const isValidOTP = await verifyOTPHash(otp, otp_hash);

    if (!isValidOTP) {
      // Increment attempt counter
      await query("UPDATE otp_store SET attempts = attempts + 1 WHERE email = $1", [
        email,
      ]);
      return res.status(401).json({
        message: "Invalid OTP. Please try again.",
      });
    }

    // OTP is valid - get user details
    const userResult = await query(
      'SELECT userid, username, email, "Role" FROM "USER" WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    const user = userResult.rows[0];

    // Delete OTP record (one-time use)
    await query("DELETE FROM otp_store WHERE email = $1", [email]);

    // Generate JWT token
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
      role: user.Role,
    };

    return res.status(200).json({
      message: "OTP verified successfully",
      token,
      user: userResponse,
    });
  } catch (err) {
    console.error("OTP verification error:", err);
    return res.status(500).json({ message: "Server error during OTP verification" });
  }
};

/**
 * Handle OTP resend request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const handleResendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate input
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    if (!isEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Check if user exists
    const userResult = await query('SELECT userid, email FROM "USER" WHERE email = $1', [
      email,
    ]);

    if (userResult.rows.length === 0) {
      // Don't reveal if email exists (security)
      return res.status(200).json({
        message: "If the email exists, a new OTP has been sent",
      });
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpHash = await hashOTP(otp);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Delete any existing OTP for this email
    await query("DELETE FROM otp_store WHERE email = $1", [email]);

    // Store new OTP hash
    await query(
      "INSERT INTO otp_store (email, otp_hash, expires_at) VALUES ($1, $2, $3)",
      [email, otpHash, expiresAt]
    );

    // Send OTP via email
    const emailSent = await sendOTPEmail(email, otp);

    if (!emailSent) {
      return res.status(500).json({
        message: "Failed to send OTP. Please try again later.",
      });
    }

    return res.status(200).json({
      message: "OTP sent successfully to your email",
      expiresIn: 600, // 10 minutes in seconds
    });
  } catch (err) {
    console.error("Resend OTP error:", err);
    return res.status(500).json({ message: "Server error during OTP resend" });
  }
};

/**
 * Handle pre-registration OTP request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const handleRequestRegistration = async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      role = "student",
      contact_no,
      departmentId,
      rollNumber,
      yearOfStudy,
      division,
      designation,
    } = req.body;

    // Validate input
    if (!username || !email || !password || !contact_no) {
      return res.status(400).json({
        message: "username, email, password, and contact_no are required",
      });
    }

    if (!isEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    const normalizedRole = role.toLowerCase();
    if (!ALLOWED_ROLES.has(normalizedRole)) {
      return res.status(400).json({
        message: `Invalid role. Allowed roles are: ${[...ALLOWED_ROLES].join(", ")}`,
      });
    }

    // Check if email already exists
    const userExists = await query(
      'SELECT 1 FROM "USER" WHERE email = $1',
      [email]
    );

    if (userExists.rows.length > 0) {
      return res.status(409).json({ message: "Email already registered" });
    }

    // Generate OTP
    const otp = generateOTP();
    console.log(`[DEV] OTP for ${email}: ${otp}`); // Log for development
    const otpHash = await hashOTP(otp);

    // Set expiry to 5 minutes
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Prepare user data to store
    const userData = {
      username,
      email,
      password, // Will be hashed during actual registration
      role: normalizedRole,
      contact_no,
      departmentId: departmentId ? parseInt(departmentId) : null,
      rollNumber: rollNumber || null,
      yearOfStudy: yearOfStudy || null,
      division: division || null,
      designation: designation || null,
    };

    // Delete any existing pending verification for this email
    await query("DELETE FROM pending_verifications WHERE email = $1", [email]);

    // Store OTP hash and user data
    await query(
      "INSERT INTO pending_verifications (email, otp_hash, user_data_json, expires_at) VALUES ($1, $2, $3, $4)",
      [email, otpHash, JSON.stringify(userData), expiresAt]
    );

    // Send OTP via email
    const emailSent = await sendOTPEmail(email, otp);

    if (!emailSent) {
      return res.status(500).json({
        message: "Failed to send OTP. Please try again later.",
      });
    }

    return res.status(200).json({
      message: "OTP sent successfully to your email. Please verify to complete registration.",
      email: email,
      expiresIn: 300, // 5 minutes in seconds
    });
  } catch (err) {
    console.error("Request registration error:", err);
    return res.status(500).json({ message: "Server error during registration request" });
  }
};

/**
 * Handle registration OTP verification
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const handleVerifyRegistration = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Validate input
    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    if (!isEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (otp.length !== 6 || isNaN(otp)) {
      return res.status(400).json({ message: "Invalid OTP format" });
    }

    // Get pending verification
    const verificationResult = await query(
      "SELECT otp_hash, expires_at, user_data_json, attempts FROM pending_verifications WHERE email = $1",
      [email]
    );

    if (verificationResult.rows.length === 0) {
      return res.status(400).json({
        message: "No pending verification found. Please request registration again.",
      });
    }

    const { otp_hash, expires_at, user_data_json, attempts } = verificationResult.rows[0];

    // Check if OTP has expired
    if (new Date() > new Date(expires_at)) {
      await query("DELETE FROM pending_verifications WHERE email = $1", [email]);
      return res.status(400).json({
        message: "OTP has expired. Please request registration again.",
      });
    }

    // Check attempt limit
    if (attempts >= 5) {
      await query("DELETE FROM pending_verifications WHERE email = $1", [email]);
      return res.status(429).json({
        message: "Maximum OTP attempts exceeded. Please request registration again.",
      });
    }

    // Verify OTP
    const isValidOTP = await verifyOTPHash(otp, otp_hash);

    if (!isValidOTP) {
      await query(
        "UPDATE pending_verifications SET attempts = attempts + 1 WHERE email = $1",
        [email]
      );
      return res.status(401).json({
        message: "Invalid OTP. Please try again.",
      });
    }

    // OTP is valid - proceed with user registration
    // user_data_json is already a JS object when retrieved from JSONB column
    const userData = typeof user_data_json === 'string' ? JSON.parse(user_data_json) : user_data_json;

    try {
      // Start transaction
      await pool.query("BEGIN");

      // Check if email still doesn't exist (double-check)
      const userExists = await query(
        'SELECT 1 FROM "USER" WHERE email = $1',
        [email]
      );

      if (userExists.rows.length > 0) {
        await query("ROLLBACK");
        return res.status(409).json({ message: "Email already registered" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      // Determine database role
      let dbRole = userData.role.charAt(0).toUpperCase() + userData.role.slice(1);
      if (userData.role === "staff" || userData.role === "faculty") {
        dbRole = "Faculty";
      }

      // Insert into USER table
      const userInsertSql =
        'INSERT INTO "USER" (username, email, passwordhash, "Role", contact_no) VALUES ($1, $2, $3, $4, $5) RETURNING userid';

      const userResult = await query(userInsertSql, [
        userData.username,
        userData.email,
        hashedPassword,
        dbRole,
        userData.contact_no,
      ]);

      const userId = userResult.rows[0].userid;

      // Handle role-specific inserts
      if (dbRole === "Student") {
        // Get division ID
        const divisionResult = await query(
          "SELECT divisionid FROM division WHERE departmentid = $1 AND divisionname = $2",
          [userData.departmentId, userData.division]
        );

        if (divisionResult.rows.length === 0) {
          await query("ROLLBACK");
          return res.status(400).json({
            message: `Invalid Division: ${userData.division}`,
          });
        }

        const divisionId = divisionResult.rows[0].divisionid;

        await query(
          "INSERT INTO student (userid, divisionid, rollnumber, yearofstudy) VALUES ($1, $2, $3, $4)",
          [userId, divisionId, userData.rollNumber, userData.yearOfStudy]
        );
      } else if (dbRole === "Faculty") {
        await query(
          "INSERT INTO faculty (userid, departmentid, designation, name, email) VALUES ($1, $2, $3, $4, $5)",
          [userId, userData.departmentId, userData.designation || "Pending Assignment", userData.username, userData.email]
        );
      } else if (dbRole === "Admin") {
        await query(
          "INSERT INTO admin (userid, name, email) VALUES ($1, $2, $3)",
          [userId, userData.username, userData.email]
        );
      }

      // Commit transaction
      await query("COMMIT");

      // Delete pending verification
      await query("DELETE FROM pending_verifications WHERE email = $1", [email]);

      return res.status(201).json({
        message: "Registration successful! Your account has been created.",
        user: {
          userId,
          username: userData.username,
          email: userData.email,
          role: dbRole,
        },
      });
    } catch (dbErr) {
      await query("ROLLBACK");
      console.error("Database error during registration:", dbErr);
      return res.status(500).json({
        message: "Error creating account. Please try again.",
      });
    }
  } catch (err) {
    console.error("Verify registration error:", err);
    return res.status(500).json({
      message: "Server error during registration verification",
    });
  }
};

/**
 * Handle registration OTP resend
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const handleResendRegistrationOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    if (!isEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Get pending verification
    const verificationResult = await query(
      "SELECT id FROM pending_verifications WHERE email = $1",
      [email]
    );

    if (verificationResult.rows.length === 0) {
      return res.status(400).json({
        message: "No pending verification found for this email.",
      });
    }

    // Generate new OTP
    const otp = generateOTP();
    console.log(`[DEV] Resent OTP for ${email}: ${otp}`);
    const otpHash = await hashOTP(otp);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Update pending verification with new OTP
    await query(
      "UPDATE pending_verifications SET otp_hash = $1, expires_at = $2, attempts = 0 WHERE email = $3",
      [otpHash, expiresAt, email]
    );

    // Send OTP via email
    const emailSent = await sendOTPEmail(email, otp);

    if (!emailSent) {
      return res.status(500).json({
        message: "Failed to send OTP. Please try again later.",
      });
    }

    return res.status(200).json({
      message: "OTP sent successfully to your email",
      expiresIn: 300, // 5 minutes in seconds
    });
  } catch (err) {
    console.error("Resend registration OTP error:", err);
    return res.status(500).json({ message: "Server error during OTP resend" });
  }
};

export default {
  generateOTP,
  hashOTP,
  verifyOTPHash,
  handleLogin,
  handleVerifyOTP,
  handleResendOTP,
  handleRequestRegistration,
  handleVerifyRegistration,
  handleResendRegistrationOTP,
};
