import nodemailer from "nodemailer";

type VerificationEmailInput = {
  to: string;
  name: string;
  verificationLink: string;
};

function getAppUrl() {
  return process.env.APP_URL ?? "http://localhost:3000";
}

export function buildVerificationLink(token: string) {
  return `${getAppUrl()}/verify-email?token=${encodeURIComponent(token)}`;
}

export async function sendVerificationEmail({
  to,
  name,
  verificationLink,
}: VerificationEmailInput) {
  if (process.env.NODE_ENV !== "production" && !process.env.SMTP_HOST) {
    return {
      sent: false,
      verificationLink,
    };
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: Number(process.env.SMTP_PORT ?? 587) === 465,
    auth:
      process.env.SMTP_USER && process.env.SMTP_PASS
        ? {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          }
        : undefined,
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: "Verify your Ekspedisi Online email",
    text: `Halo ${name}, buka link berikut untuk verifikasi email: ${verificationLink}`,
    html: `<p>Halo ${name},</p><p>Buka link berikut untuk verifikasi email:</p><p><a href="${verificationLink}">${verificationLink}</a></p>`,
  });

  return {
    sent: true,
    verificationLink: process.env.NODE_ENV !== "production" ? verificationLink : null,
  };
}
