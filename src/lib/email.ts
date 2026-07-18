import nodemailer from "nodemailer";
import { env } from "@/config/env";
import { ValidationError } from "@/lib/errors";

type VerificationEmailInput = {
  to: string;
  name: string;
  verificationLink: string;
};

export function buildVerificationLink(token: string) {
  return `${env.APP_URL}/customer/verify-email?token=${encodeURIComponent(token)}`;
}

let transporterInstance: nodemailer.Transporter | null = null;

function getTransporter() {
  if (transporterInstance) {
    return transporterInstance;
  }

  const host = env.SMTP_HOST;
  const user = env.SMTP_USER;
  const pass = env.SMTP_PASS;
  const port = env.SMTP_PORT;

  if (!host || !user || !pass || pass === "app_password_gmail" || pass.includes("ISI_APP_PASSWORD")) {
    throw new ValidationError("SMTP email belum dikonfigurasi", {
      email: [
        "Isi SMTP_HOST, SMTP_USER, dan SMTP_PASS dengan konfigurasi Mailtrap.",
      ],
    });
  }

  transporterInstance = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });

  return transporterInstance;
}

export async function sendVerificationEmail({
  to,
  name,
  verificationLink,
}: VerificationEmailInput) {
  try {
    const transporter = getTransporter();
    const from = env.MAILTRAP_FROM;

    await transporter.verify();

    if (env.NODE_ENV === "development") {
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

    if (env.NODE_ENV === "development") {
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
        "Periksa koneksi SMTP dan internet lalu coba register ulang.",
      ],
    });
  }
}