import nodemailer from "nodemailer";
import { env } from "../../config/env.js";

const transporter = nodemailer.createTransport({
  host: env.email.host,
  port: env.email.port,
  secure: env.email.port === 465,
  auth: {
    user: env.email.user,
    pass: env.email.pass,
  },
});

export const sendOTPEmail = async (email, otp) => {
  const mailOptions = {
    from: env.email.from,
    to: email,
    subject: "Your College Companion OTP",
    text: `Your College Companion OTP is: ${otp}\n\nValid for 5 minutes.\n\nDo not share this OTP with anyone.`,
  };

  await transporter.sendMail(mailOptions);
  return true;
};

export const verifyEmailService = async () => {
  await transporter.verify();
  return true;
};

export default { sendOTPEmail, verifyEmailService };
