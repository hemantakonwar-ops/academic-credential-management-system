const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT, 10),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async ({ to, subject, html }) => {
  const mailOptions = {
    from: `"ACMS" <${process.env.EMAIL_FROM}>`,
    to,
    subject,
    html,
  };
  return transporter.sendMail(mailOptions);
};

const sendWelcomeEmail = async (user) => {
  return sendEmail({
    to: user.email,
    subject: 'Welcome to ACMS — Verify Your Email',
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:auto;background:#0f1a14;color:#e0f2eb;padding:32px;border-radius:12px;">
        <h1 style="color:#1D9E75">Welcome to ACMS! 🎓</h1>
        <p>Hi <strong>${user.fullName}</strong>,</p>
        <p>Your account has been created. You can now securely store and manage your academic credentials.</p>
        <a href="${process.env.CLIENT_URL}/login" 
           style="display:inline-block;background:#1D9E75;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;margin-top:16px;">
          Log In to ACMS
        </a>
        <p style="margin-top:24px;font-size:12px;color:#6b7280;">
          If you didn't create this account, you can safely ignore this email.
        </p>
      </div>
    `,
  });
};

const sendPasswordResetEmail = async (user, resetToken) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
  return sendEmail({
    to: user.email,
    subject: 'ACMS — Password Reset Request',
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:auto;background:#0f1a14;color:#e0f2eb;padding:32px;border-radius:12px;">
        <h1 style="color:#1D9E75">Reset Your Password</h1>
        <p>Hi <strong>${user.fullName}</strong>,</p>
        <p>You requested a password reset. Click the button below. This link expires in <strong>1 hour</strong>.</p>
        <a href="${resetUrl}"
           style="display:inline-block;background:#1D9E75;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;margin-top:16px;">
          Reset Password
        </a>
        <p style="margin-top:24px;font-size:12px;color:#6b7280;">
          If you didn't request this, ignore this email — your password won't change.
        </p>
      </div>
    `,
  });
};

module.exports = { sendEmail, sendWelcomeEmail, sendPasswordResetEmail };
