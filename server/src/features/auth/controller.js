import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool, query } from "../../db/pool.js";
import { sendOTPEmail } from "../../shared/services/emailService.js";
import { env } from "../../config/env.js";
import {
  generateOTP,
  hashOTP,
  verifyOTPHash,
  saveOtp,
  getOtp,
  clearOtp,
  incrementAttempts,
  otpTTLSeconds,
} from "./otpStore.js";
import { logAudit } from "../audit/auditService.js";

const ALLOWED_ROLES = new Set(["student", "faculty", "staff", "admin"]);

const normalizeRole = (role = "student") => role.toLowerCase();

export const handleLoginRequestOtp = async (req, res) => {
  try {
    const { email, password, channel = "email" } = req.body;

    if (channel !== "email") {
      return res.status(400).json({ message: "Only email OTP is enabled right now." });
    }

    const userResult = await query(
      'SELECT userid, username, email, passwordhash, "Role" FROM "USER" WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) return res.status(400).json({ message: "Invalid email or password" });

    const user = userResult.rows[0];
    const isMatch = await bcrypt.compare(password, user.passwordhash);
    if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

    const otp = generateOTP();
    const otpHash = await hashOTP(otp);

    await saveOtp({
      purpose: "login",
      email,
      otpHash,
      payload: {
        userId: user.userid,
        username: user.username,
        role: user.Role ? user.Role.toLowerCase() : undefined,
        email: user.email,
      },
    });

    await sendOTPEmail(email, otp);

    return res.status(200).json({ message: "OTP sent successfully", email, expiresIn: otpTTLSeconds });
  } catch (err) {
    console.error("Login OTP request error:", err);
    return res.status(500).json({ message: "Server error during login" });
  }
};

export const handleVerifyLoginOtp = async (req, res) => {
  try {
    if (!env.jwtSecret) return res.status(500).json({ message: "JWT secret not configured" });
    const { email, otp } = req.body;
    const otpRecord = await getOtp({ purpose: "login", email });
    if (!otpRecord) return res.status(400).json({ message: "No OTP found. Request a new one." });

    if ((otpRecord.attempts || 0) >= 5) {
      return res.status(429).json({ message: "Too many attempts" });
    }

    const isValid = await verifyOTPHash(otp, otpRecord.otp_hash);
    if (!isValid) {
      await incrementAttempts({ purpose: "login", email });
      return res.status(401).json({ message: "Invalid OTP" });
    }

    const payload = otpRecord.payload || {};
    const token = jwt.sign(
      { userId: payload.userId, username: payload.username, role: payload.role },
      env.jwtSecret,
      { expiresIn: "4h" }
    );

    await clearOtp({ purpose: "login", email });

    await logAudit({
      actorUserId: payload.userId,
      actorRole: payload.role,
      action: "login",
      entityType: "USER",
      entityId: String(payload.userId),
      metadata: { email },
    });

    return res.status(200).json({
      message: "OTP verified",
      token,
      user: { userId: payload.userId, username: payload.username, email: payload.email, role: payload.role },
    });
  } catch (err) {
    console.error("Login OTP verification error:", err);
    return res.status(500).json({ message: "Verification error" });
  }
};

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
      channel = "email",
    } = req.body;

    if (channel !== "email") {
      return res.status(400).json({ message: "Only email OTP is enabled right now." });
    }

    const normalizedRole = normalizeRole(role);
    if (!ALLOWED_ROLES.has(normalizedRole)) return res.status(400).json({ message: "Invalid role" });

    const userExists = await query('SELECT 1 FROM "USER" WHERE email = $1', [email]);
    if (userExists.rows.length > 0) return res.status(409).json({ message: "Email already registered" });

    const otp = generateOTP();
    const otpHash = await hashOTP(otp);

    const userData = {
      username,
      email,
      password,
      role: normalizedRole,
      contact_no,
      departmentId,
      rollNumber,
      yearOfStudy,
      division,
      designation,
    };

    await saveOtp({
      purpose: "register",
      email,
      otpHash,
      payload: userData,
    });

    await sendOTPEmail(email, otp);
    return res.status(200).json({ message: "OTP sent successfully", email, expiresIn: otpTTLSeconds });
  } catch (err) {
    console.error("Registration request error:", err);
    return res.status(500).json({ message: "Server error during registration" });
  }
};

export const handleVerifyRegistration = async (req, res) => {
  const client = await pool.connect();
  try {
    if (!env.jwtSecret) return res.status(500).json({ message: "JWT secret not configured" });
    const { email, otp } = req.body;
    const otpRecord = await getOtp({ purpose: "register", email });
    if (!otpRecord) return res.status(400).json({ message: "No pending registration found" });

    if ((otpRecord.attempts || 0) >= 5) return res.status(429).json({ message: "Max attempts reached" });

    const isValid = await verifyOTPHash(otp, otpRecord.otp_hash);
    if (!isValid) {
      await incrementAttempts({ purpose: "register", email });
      return res.status(401).json({ message: "Invalid OTP" });
    }

    const userData = otpRecord.payload;
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    await client.query("BEGIN");

    let dbRole = userData.role.charAt(0).toUpperCase() + userData.role.slice(1);
    if (userData.role === "staff" || userData.role === "faculty") dbRole = "Faculty";

    const userRes = await client.query(
      'INSERT INTO "USER" (username, email, passwordhash, "Role", contact_no) VALUES ($1, $2, $3, $4, $5) RETURNING userid',
      [userData.username, userData.email, hashedPassword, dbRole, userData.contact_no]
    );
    const userId = userRes.rows[0].userid;

    if (dbRole === "Student") {
      const divRes = await client.query(
        "SELECT divisionid FROM division WHERE departmentid = $1 AND divisionname = $2",
        [userData.departmentId, userData.division]
      );
      if (divRes.rows.length === 0) throw new Error("Division not found");
      await client.query(
        "INSERT INTO student (userid, divisionid, rollnumber, yearofstudy, name, email) VALUES ($1, $2, $3, $4, $5, $6)",
        [userId, divRes.rows[0].divisionid, userData.rollNumber, userData.yearOfStudy, userData.username, userData.email]
      );
    } else if (dbRole === "Faculty") {
      await client.query(
        "INSERT INTO faculty (userid, departmentid, designation, name, email) VALUES ($1, $2, $3, $4, $5)",
        [userId, userData.departmentId, userData.designation || "Pending Assignment", userData.username, userData.email]
      );
    }

    await client.query("COMMIT");
    await clearOtp({ purpose: "register", email });

    const token = jwt.sign({ userId, username: userData.username, role: dbRole }, env.jwtSecret, { expiresIn: "4h" });

    await logAudit({
      actorUserId: userId,
      actorRole: dbRole.toLowerCase(),
      action: "register",
      entityType: "USER",
      entityId: String(userId),
      metadata: { email: userData.email },
    });

    return res.status(201).json({ message: "Account created successfully", token, user: { userId, email, role: dbRole } });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Final Registration Error:", err);
    return res.status(500).json({ message: "Error creating account" });
  } finally {
    client.release();
  }
};

export const handleResendRegistrationOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const existing = await getOtp({ purpose: "register", email });
    if (!existing) return res.status(400).json({ message: "No pending verification" });

    const otp = generateOTP();
    const otpHash = await hashOTP(otp);

    await saveOtp({
      purpose: "register",
      email,
      otpHash,
      payload: existing.payload,
    });

    await sendOTPEmail(email, otp);
    return res.status(200).json({ message: "Registration OTP resent", expiresIn: otpTTLSeconds });
  } catch (err) {
    console.error("Resend registration OTP error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const handleResendLoginOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const existing = await getOtp({ purpose: "login", email });
    if (!existing) return res.status(400).json({ message: "No pending login OTP" });

    const otp = generateOTP();
    const otpHash = await hashOTP(otp);

    await saveOtp({
      purpose: "login",
      email,
      otpHash,
      payload: existing.payload,
    });

    await sendOTPEmail(email, otp);
    return res.status(200).json({ message: "Login OTP resent", expiresIn: otpTTLSeconds });
  } catch (err) {
    console.error("Resend login OTP error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
