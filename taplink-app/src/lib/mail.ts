import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST ?? "localhost",
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: process.env.SMTP_SECURE === "true",
  auth:
    process.env.SMTP_USER && process.env.SMTP_PASS
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
});

const from = process.env.EMAIL_FROM ?? "noreply@taplink.local";
const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const appName = process.env.NEXT_PUBLIC_APP_NAME ?? "Taplink";

export async function sendVerificationEmail(email: string, token: string) {
  const url = `${appUrl}/auth/verify?token=${token}`;
  await transporter.sendMail({
    from: `"${appName}" <${from}>`,
    to: email,
    subject: `Verify your ${appName} account`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto">
        <h2>Welcome to ${appName}!</h2>
        <p>Click the button below to verify your email address.</p>
        <a href="${url}" style="display:inline-block;background:#6c63ff;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">
          Verify Email
        </a>
        <p style="color:#999;font-size:12px;margin-top:24px">
          This link expires in 24 hours. If you didn't create an account, ignore this email.
        </p>
      </div>`,
  });
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const url = `${appUrl}/auth/reset-password?token=${token}`;
  await transporter.sendMail({
    from: `"${appName}" <${from}>`,
    to: email,
    subject: `Reset your ${appName} password`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto">
        <h2>Password Reset</h2>
        <p>Click the button below to reset your password. This link expires in 1 hour.</p>
        <a href="${url}" style="display:inline-block;background:#6c63ff;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">
          Reset Password
        </a>
        <p style="color:#999;font-size:12px;margin-top:24px">
          If you didn't request a password reset, ignore this email.
        </p>
      </div>`,
  });
}
