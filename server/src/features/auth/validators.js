import Joi from "joi";

export const requestRegistrationSchema = Joi.object({
  username: Joi.string().min(3).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid("student", "faculty", "staff", "admin", "Student", "Faculty", "Staff", "Admin").optional(),
  contact_no: Joi.string().min(10).required(),
  departmentId: Joi.number().integer().optional(),
  rollNumber: Joi.string().optional(),
  yearOfStudy: Joi.number().integer().optional(),
  division: Joi.string().optional(),
  designation: Joi.string().optional(),
  channel: Joi.string().valid("email").optional(),
});

export const verifyOtpSchema = Joi.object({
  email: Joi.string().email().required(),
  otp: Joi.string().length(6).required(),
});

export const resendOtpSchema = Joi.object({
  email: Joi.string().email().required(),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  channel: Joi.string().valid("email").optional(),
});
