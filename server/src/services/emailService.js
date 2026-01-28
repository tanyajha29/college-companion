import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

/**
 * Email Service for sending OTP emails
 * Uses Nodemailer to send OTP to user's email
 */

// Initialize Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD, // Use app-specific password for Gmail
  },
});

/**
 * Send OTP to user's email
 * @param {string} email - User's email address
 * @param {string} otp - 6-digit OTP to send
 * @returns {Promise<boolean>} - True if email sent successfully
 */
export const sendOTPEmail = async (email, otp) => {
  try {
    const mailOptions = {
      from: `"College Companion" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your College Companion OTP - Valid for 10 minutes",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                color: #333;
                line-height: 1.6;
              }
              .container {
                max-width: 500px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 30px;
                border-radius: 8px 8px 0 0;
                text-align: center;
              }
              .content {
                background-color: #f8f9fa;
                padding: 30px;
                border-radius: 0 0 8px 8px;
              }
              .otp-box {
                background-color: white;
                border: 2px dashed #667eea;
                padding: 20px;
                border-radius: 8px;
                text-align: center;
                margin: 20px 0;
              }
              .otp-code {
                font-size: 36px;
                font-weight: bold;
                color: #667eea;
                letter-spacing: 4px;
                font-family: "Courier New", monospace;
              }
              .warning {
                background-color: #fff3cd;
                border-left: 4px solid #ffc107;
                padding: 12px;
                border-radius: 4px;
                margin: 15px 0;
                font-size: 14px;
              }
              .footer {
                text-align: center;
                color: #666;
                font-size: 12px;
                margin-top: 20px;
                padding-top: 20px;
                border-top: 1px solid #ddd;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h2 style="margin: 0;">College Companion</h2>
                <p style="margin: 10px 0 0 0;">Two-Step Authentication</p>
              </div>
              <div class="content">
                <p>Hello,</p>
                <p>You requested to log in to your College Companion account. Use the OTP below to complete your login:</p>
                
                <div class="otp-box">
                  <div class="otp-code">${otp}</div>
                  <p style="margin: 10px 0 0 0; color: #666; font-size: 14px;">Valid for 10 minutes</p>
                </div>
                
                <div class="warning">
                  <strong>Security Notice:</strong> Never share this OTP with anyone. College Companion support will never ask for your OTP.
                </div>
                
                <p>If you didn't request this OTP, you can safely ignore this email.</p>
                
                <div class="footer">
                  <p>© 2024 College Companion. All rights reserved.</p>
                  <p>This is an automated message. Please do not reply to this email.</p>
                </div>
              </div>
            </div>
          </body>
        </html>
      `,
      text: `Your College Companion OTP is: ${otp}\n\nValid for 10 minutes.\n\nDo not share this OTP with anyone.`,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ OTP email sent successfully to ${email}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to send OTP email to ${email}:`, error.message);
    return false;
  }
};

/**
 * Verify transporter connection (optional - for debugging)
 */
export const verifyEmailService = async () => {
  try {
    await transporter.verify();
    console.log("✅ Email service is ready to send emails");
    return true;
  } catch (error) {
    console.error("❌ Email service verification failed:", error.message);
    return false;
  }
};

export default { sendOTPEmail, verifyEmailService };
