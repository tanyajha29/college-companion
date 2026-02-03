import express from "express";
import rateLimit from "express-rate-limit";
import {
  handleLoginRequestOtp,
  handleVerifyLoginOtp,
  handleResendLoginOTP,
  handleRequestRegistration,
  handleVerifyRegistration,
  handleResendRegistrationOTP,
} from "./controller.js";
import { validate } from "../../shared/middleware/validate.js";
import {
  requestRegistrationSchema,
  verifyOtpSchema,
  resendOtpSchema,
  loginSchema,
} from "./validators.js";

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many login attempts. Please try again after 15 minutes.",
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === "test",
});

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Too many OTP verification attempts. Please try again after 15 minutes.",
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === "test",
});

const resendLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 3,
  message: "Too many resend requests. Please wait before requesting another OTP.",
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === "test",
});

router.post("/request-registration", resendLimiter, validate(requestRegistrationSchema), handleRequestRegistration);
router.post("/verify-registration", otpLimiter, validate(verifyOtpSchema), handleVerifyRegistration);
router.post("/resend-registration-otp", resendLimiter, validate(resendOtpSchema), handleResendRegistrationOTP);

router.post("/login", loginLimiter, validate(loginSchema), handleLoginRequestOtp);
router.post("/verify-otp", otpLimiter, validate(verifyOtpSchema), handleVerifyLoginOtp);
router.post("/resend-otp", resendLimiter, validate(resendOtpSchema), handleResendLoginOTP);

export default router;
