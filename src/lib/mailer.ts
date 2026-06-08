// src/lib/mailer.ts
import nodemailer from "nodemailer";

// 1. Initialise the base SMTP transport engine instance
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_PORT === "465", // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface SendOtpEmailArgs {
  toEmail: string;
  userName: string;
  otpCode: string;
}

/**
 * Transmits a 6-digit secure registration OTP verification code to a client.
 */
export async function sendOtpEmail({ toEmail, userName, otpCode }: SendOtpEmailArgs) {
  const mailOptions = {
    from: `"Custom Made Furniture" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: "Verify Your Account - Security Access Code",
    html: `
      <div style="font-family: 'Poppins', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #fafaf9;">
        <h2 style="color: #451a03; font-weight: 800; border-bottom: 2px solid #edd4c2; padding-bottom: 10px;">Account Activation Code</h2>
        <p style="color: #4a5568; font-size: 16px;">Hello ${userName},</p>
        <p style="color: #4a5568; font-size: 14px; line-height: 1.6;">Thank you for registering an account. To unlock custom submissions and review permissions, verify your email using the verification code below:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <span style="display: inline-block; font-size: 32px; font-weight: 800; color: #451a03; letter-spacing: 6px; padding: 12px 30px; border: 2px dashed #b45309; border-radius: 8px; background-color: #fffbeb;">
            ${otpCode}
          </span>
        </div>
        
        <p style="color: #e53e3e; font-size: 12px; font-weight: 600;">⚠️ This security verification token will automatically expire in 15 minutes.</p>
        <hr style="border: 0; border-top: 1px solid #edd4c2; margin: 20px 0;" />
        <p style="color: #a0aec0; font-size: 11px; text-align: center;">If you did not request this email registration string, you can safely ignore this document.</p>
      </div>
    `,
  };

  return await transporter.sendMail(mailOptions);
}


// Add this to your existing src/lib/mailer.ts file

interface SendResetEmailArgs {
  toEmail: string;
  userName: string;
  resetToken: string;
}

/**
 * Transmits a secure, unique password recovery link to an account holder.
 */
export async function sendResetPasswordEmail({ toEmail, userName, resetToken }: SendResetEmailArgs) {
  // Build absolute fallback production deployment domain reference strings
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const resetUrl = `${siteUrl}/reset-password?token=${resetToken}`;

  const mailOptions = {
    from: `"Custom Made Furniture" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: "Reset Your Account Password",
    html: `
      <div style="font-family: 'Poppins', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #fafaf9;">
        <h2 style="color: #451a03; font-weight: 800; border-bottom: 2px solid #edd4c2; padding-bottom: 10px;">Password Reset Request</h2>
        <p style="color: #4a5568; font-size: 16px;">Hello ${userName},</p>
        <p style="color: #4a5568; font-size: 14px; line-height: 1.6;">We received a request to reset the account password paired with this email profile address. Click the action block button below to configure a new password:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="display: inline-block; font-size: 14px; font-weight: 700; color: #ffffff; background-color: #451a03; padding: 12px 28px; text-decoration: none; border-radius: 8px; shadow: 0 4px 6px -1px rgba(0,0,0,0.1);" aria-label="Configure new password now">
            Configure New Password
          </a>
        </div>
        
        <p style="color: #e53e3e; font-size: 12px; font-weight: 600;">⚠️ This transactional configuration link will automatically expire in 1 hour.</p>
        <p style="color: #718096; font-size: 12px;">If clicking the button fails, copy and paste this text URL parameter path into your browser search bar:</p>
        <p style="color: #3182ce; font-size: 12px; word-break: break-all;">${resetUrl}</p>
        <hr style="border: 0; border-top: 1px solid #edd4c2; margin: 20px 0;" />
        <p style="color: #a0aec0; font-size: 11px; text-align: center;">If you did not issue this password modification, please ignore this email. Your password will remain completely unchanged.</p>
      </div>
    `,
  };

  return await transporter.sendMail(mailOptions);
}


// Add this to your existing src/lib/mailer.ts file

interface SendContactNotificationArgs {
  clientName: string;
  clientEmail: string;
  subjectLine: string;
  messageText: string;
}

/**
 * Forwards custom furniture specifications or workspace design briefs 
 * left on the contact form directly to the business owner's email address.
 */
export async function sendContactNotificationToOwner({
  clientName,
  clientEmail,
  subjectLine,
  messageText,
}: SendContactNotificationArgs) {
  
  const targetInbox = process.env.OWNER_EMAIL || process.env.SMTP_USER || "";

  const mailOptions = {
    from: `"Web Inquiry Desk" <${process.env.SMTP_USER}>`,
    to: targetInbox,
    replyTo: clientEmail, // Lets you hit "Reply" in your email client to message the user back instantly
    subject: `🚨 New Contact Inquiry: ${subjectLine}`,
    html: `
      <div style="font-family: 'Poppins', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #fafaf9;">
        <h2 style="color: #451a03; font-weight: 800; border-bottom: 2px solid #edd4c2; padding-bottom: 10px; margin-top: 0;">New Custom Sizing Blueprint Inquiry</h2>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr>
            <td style="padding: 6px 0; font-weight: bold; color: #451a03; width: 120px;">Client Name:</td>
            <td style="padding: 6px 0; color: #4a5568;">${clientName}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: bold; color: #451a03;">Client Email:</td>
            <td style="padding: 6px 0; color: #3182ce;"><a href="mailto:${clientEmail}" aria-label="Reply to client">${clientEmail}</a></td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: bold; color: #451a03;">Form Topic:</td>
            <td style="padding: 6px 0; color: #4a5568;">${subjectLine}</td>
          </tr>
        </table>
        
        <div style="background-color: #ffffff; border: 1px solid #edd4c2; border-radius: 8px; padding: 15px; margin-top: 10px;">
          <h4 style="margin: 0 0 10px 0; color: #451a03; font-weight: 700;">Client Message Details:</h4>
          <p style="color: #4a5568; font-size: 14px; line-height: 1.6; margin: 0; white-space: pre-wrap;">${messageText}</p>
        </div>
        
        <hr style="border: 0; border-top: 1px solid #edd4c2; margin: 20px 0;" />
        <p style="color: #a0aec0; font-size: 11px; text-align: center; margin: 0;">This transmission was generated automatically by your online portfolio application desk.</p>
      </div>
    `,
  };

  return await transporter.sendMail(mailOptions);
}
