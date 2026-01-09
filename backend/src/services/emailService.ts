import nodemailer from "nodemailer";
import { env } from "../config/env";

// Create reusable transporter using Brevo SMTP
const transporter = nodemailer.createTransport({
  host: env.email.smtp.host,
  port: env.email.smtp.port,
  secure: false, // true for 465, false for other ports
  auth: {
    user: env.email.smtp.user,
    pass: env.email.smtp.pass,
  },
});

// Verify transporter configuration on startup (only in development)
if (env.nodeEnv === "development") {
  transporter.verify((error, success) => {
    if (error) {
      console.error("❌ Email service configuration error:", error.message);
      console.log("💡 Please configure your Brevo SMTP credentials in .env file");
    } else {
      console.log("✅ Email service is ready to send emails");
    }
  });
}

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send an email using Brevo SMTP
 */
export async function sendEmail(options: EmailOptions): Promise<void> {
  console.log("==================================================================");
  console.log("📧 Email Service (Simulation) - Logging Email Content:");
  console.log("------------------------------------------------------------------");
  console.log("To:", options.to);
  console.log("Subject:", options.subject);
  console.log("Text Body:", options.text);
  console.log("==================================================================");

  // Email service is temporarily disabled for debugging
  /*
  try {
    const info = await transporter.sendMail({
      from: `"${env.email.fromName}" <${env.email.from}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });

    if (env.nodeEnv === "development") {
      console.log("📧 Email sent:", info.messageId);
      console.log("   To:", options.to);
      console.log("   Subject:", options.subject);
    }
  } catch (error) {
    console.error("❌ Error sending email:", error);
    throw new Error("Failed to send email");
  }
  */
}

/**
 * Send verification email with token
 */
export async function sendVerificationEmail(
  email: string,
  token: string
): Promise<void> {
  const verificationUrl = `${env.appUrl}/verify-email?token=${token}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            background: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 20px;
            text-align: center;
            color: white;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
          }
          .content {
            padding: 40px 30px;
          }
          .content p {
            margin: 0 0 20px;
            font-size: 16px;
            color: #555;
          }
          .button {
            display: inline-block;
            padding: 14px 32px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            font-size: 16px;
            margin: 20px 0;
            transition: transform 0.2s;
          }
          .button:hover {
            transform: translateY(-2px);
          }
          .footer {
            background: #f8f9fa;
            padding: 20px 30px;
            text-align: center;
            font-size: 14px;
            color: #666;
            border-top: 1px solid #e9ecef;
          }
          .link {
            color: #667eea;
            word-break: break-all;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome!</h1>
          </div>
          <div class="content">
            <p>Hello,</p>
            <p>Thank you for registering! Please verify your email address to activate your account.</p>
            <p>Click the button below to verify your email:</p>
            <div style="text-align: center;">
              <a href="${verificationUrl}" class="button">Verify Email Address</a>
            </div>
            <p style="margin-top: 30px;">Or copy and paste this link into your browser:</p>
            <p class="link">${verificationUrl}</p>
            <p style="margin-top: 30px; font-size: 14px; color: #888;">
              This link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.
            </p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} ${env.email.fromName}. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `
    Welcome!
    
    Thank you for registering! Please verify your email address to activate your account.
    
    Click the link below to verify your email:
    ${verificationUrl}
    
    This link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.
    
    © ${new Date().getFullYear()} ${env.email.fromName}. All rights reserved.
  `;

  await sendEmail({
    to: email,
    subject: "Verify Your Email Address",
    html,
    text,
  });
}

/**
 * Send password reset email with token
 */
export async function sendPasswordResetEmail(
  email: string,
  token: string
): Promise<void> {
  const resetUrl = `${env.appUrl}/reset-password?token=${token}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            background: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            padding: 40px 20px;
            text-align: center;
            color: white;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
          }
          .content {
            padding: 40px 30px;
          }
          .content p {
            margin: 0 0 20px;
            font-size: 16px;
            color: #555;
          }
          .button {
            display: inline-block;
            padding: 14px 32px;
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            color: white;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            font-size: 16px;
            margin: 20px 0;
            transition: transform 0.2s;
          }
          .button:hover {
            transform: translateY(-2px);
          }
          .footer {
            background: #f8f9fa;
            padding: 20px 30px;
            text-align: center;
            font-size: 14px;
            color: #666;
            border-top: 1px solid #e9ecef;
          }
          .link {
            color: #f5576c;
            word-break: break-all;
            font-size: 14px;
          }
          .warning {
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Password Reset</h1>
          </div>
          <div class="content">
            <p>Hello,</p>
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </div>
            <p style="margin-top: 30px;">Or copy and paste this link into your browser:</p>
            <p class="link">${resetUrl}</p>
            <div class="warning">
              <strong>⚠️ Security Notice:</strong><br>
              This link will expire in 1 hour. If you didn't request a password reset, please ignore this email or contact support if you have concerns.
            </div>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} ${env.email.fromName}. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `
    Password Reset
    
    We received a request to reset your password. Click the link below to create a new password:
    ${resetUrl}
    
    This link will expire in 1 hour. If you didn't request a password reset, please ignore this email.
    
    © ${new Date().getFullYear()} ${env.email.fromName}. All rights reserved.
  `;

  await sendEmail({
    to: email,
    subject: "Reset Your Password",
    html,
    text,
  });
}
