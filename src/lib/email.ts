import nodemailer from "nodemailer";

import { ValidationError } from "@/lib/errors";

type VerificationEmailInput = {
  to: string;
  name: string;
  verificationLink: string;
};

function getAppUrl() {
  return process.env.APP_URL ?? "http://localhost:3000";
}

export function buildVerificationLink(token: string) {
  return `${getAppUrl()}/customer/verify-email?token=${encodeURIComponent(token)}`;
}

function requireEmailConfig() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.EMAIL_FROM ?? "Ekspedisi Online <iqbalasqalani656@gmail.com>";

  if (!host || !user || !pass || pass === "app_password_gmail" || pass.includes("ISI_APP_PASSWORD")) {
    throw new ValidationError("SMTP email belum dikonfigurasi", {
      email: [
        "Isi SMTP_HOST, SMTP_USER, dan SMTP_PASS dengan Gmail App Password agar email verifikasi bisa dikirim.",
      ],
    });
  }

  return { host, user, pass, from };
}

function createTransporter() {
  const { host, user, pass, from } = requireEmailConfig();
  const port = Number(process.env.SMTP_PORT ?? 587);

  return {
    from,
    transporter: nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
    }),
  };
}

export async function sendVerificationEmail({
  to,
  name,
  verificationLink,
}: VerificationEmailInput) {
  try {
    const { transporter, from } = createTransporter();

    await transporter.verify();

    if (process.env.NODE_ENV === "development") {
      console.log("Sending verification email", {
        from,
        to,
      });
    }

    const info = await transporter.sendMail({
      from,
      to,
      subject: "Verifikasi Email Akun Ekspedisi Online",
      text: `Halo ${name}, buka link berikut untuk verifikasi email: ${verificationLink}`,
      html: `<p>Halo ${name},</p><p>Buka link berikut untuk verifikasi email:</p><p><a href="${verificationLink}">${verificationLink}</a></p>`,
    });

    if (process.env.NODE_ENV === "development") {
      console.log("Verification email sent", {
        messageId: info.messageId,
        accepted: info.accepted,
        rejected: info.rejected,
        response: info.response,
      });
    }

    return {
      sent: true,
      messageId: info.messageId,
    };
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }

    throw new ValidationError("Email verifikasi gagal dikirim", {
      email: [
        "Periksa SMTP_USER, SMTP_PASS Gmail App Password, dan koneksi internet lalu coba register ulang.",
      ],
    });
  }
}