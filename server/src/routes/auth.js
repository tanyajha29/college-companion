import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool, { query } from "../db.js";
import rateLimit from "express-rate-limit";
import {
  handleLogin,
  handleVerifyOTP,
  handleResendOTP,
  handleRequestRegistration,
  handleVerifyRegistration,
  handleResendRegistrationOTP,
} from "../controllers/authController.js";

const router = express.Router();
const ALLOWED_ROLES = new Set(["student", "faculty", "staff", "admin"]);
const isEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

// Rate limiting middleware
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per IP
  message: "Too many login attempts. Please try again after 15 minutes.",
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === "test", // Skip in test environment
});

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per IP
  message: "Too many OTP verification attempts. Please try again after 15 minutes.",
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === "test",
});

const resendLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 3, // 3 resend requests per minute
  message: "Too many resend requests. Please wait before requesting another OTP.",
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === "test",
});

// ✅ REQUEST REGISTRATION - Step 1: Generate and send OTP
router.post("/request-registration", resendLimiter, handleRequestRegistration);

// ✅ VERIFY REGISTRATION - Step 2: Validate OTP and create user
router.post("/verify-registration", otpLimiter, handleVerifyRegistration);

// ✅ RESEND REGISTRATION OTP - Resend OTP during registration
router.post("/resend-registration-otp", resendLimiter, handleResendRegistrationOTP);

// ✅ LOGIN - Simple email + password (no OTP)
router.post("/login", loginLimiter, handleLogin);

// ✅ VERIFY OTP - For backward compatibility (if needed for login flow)
router.post("/verify-otp", otpLimiter, handleVerifyOTP);

// ✅ RESEND OTP - For backward compatibility (if needed for login flow)
router.post("/resend-otp", resendLimiter, handleResendOTP);

export default router;