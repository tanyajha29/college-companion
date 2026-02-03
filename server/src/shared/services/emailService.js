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
    subject: "College Companion OTP",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              margin: 0;
              padding: 0;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
              color: #333;
              line-height: 1.6;
              background: #f3f4f6;
            }
            .container {
              max-width: 520px;
              margin: 24px auto;
              background: #ffffff;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 10px 30px rgba(0,0,0,0.08);
              border: 1px solid #ececec;
            }
            .header {
              background: linear-gradient(135deg, #6b7cff 0%, #7b4ab1 100%);
              color: #ffffff;
              padding: 28px 20px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 22px;
              font-weight: 700;
            }
            .header p {
              margin: 6px 0 0 0;
              font-size: 14px;
              opacity: 0.95;
            }
            .content {
              padding: 24px 24px 8px 24px;
              background: #ffffff;
            }
            .otp-box {
              border: 2px dashed #6b7cff;
              border-radius: 10px;
              padding: 16px;
              text-align: center;
              margin: 16px 0 8px 0;
            }
            .otp-code {
              font-size: 34px;
              letter-spacing: 6px;
              font-weight: 700;
              color: #6b7cff;
              font-family: "Courier New", monospace;
            }
            .muted {
              color: #666;
              font-size: 13px;
            }
            .footer {
              padding: 12px 24px 22px 24px;
              text-align: center;
              font-size: 12px;
              color: #888;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>College Companion</h1>
              <p>Two-Step Authentication</p>
            </div>
            <div class="content">
              <p>Hello,</p>
              <p>You requested to log in to your College Companion account. Use the OTP below to complete your login:</p>
              <div class="otp-box">
                <div class="otp-code">${otp}</div>
                <p class="muted">Valid for 5 minutes</p>
              </div>
              <p class="muted">Do not share this OTP with anyone.</p>
            </div>
            <div class="footer">
              This is an automated message. Please do not reply.
            </div>
          </div>
        </body>
      </html>
    `,
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
