import { cookies } from "next/headers";
import { randomUUID } from "crypto";

import { UnauthorizedError, ValidationError } from "@/lib/errors";
import { env } from "@/config/env";
import type { AuthRole, IdentityType } from "@/types/auth";

export const SESSION_COOKIE_NAME = "session_id";

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;
const CAPTCHA_MAX_AGE_MS = 5 * 60 * 1000;
const isProduction = env.NODE_ENV === "production";

// CaptchaState is removed as reCAPTCHA handles state externally

export type SessionUser = {
  userId: number;
  type: IdentityType;
  role: AuthRole;
  email: string;
};

type ServerSession = {
  user?: SessionUser;
  expiresAt: number;
};

const globalStore = globalThis as typeof globalThis & {
  __ekspedisiSessions?: Map<string, ServerSession>;
};

const sessions = globalStore.__ekspedisiSessions ?? new Map<string, ServerSession>();
globalStore.__ekspedisiSessions = sessions;

function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  };
}

function cleanupExpiredSessions() {
  const now = Date.now();

  sessions.forEach((session, id) => {
    if (session.expiresAt <= now) {
      sessions.delete(id);
    }
  });
}

export async function getOrCreateSessionId() {
  cleanupExpiredSessions();

  const cookieStore = await cookies();
  const existingSessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (existingSessionId && sessions.has(existingSessionId)) {
    return existingSessionId;
  }

  const sessionId = randomUUID();
  sessions.set(sessionId, {
    expiresAt: Date.now() + SESSION_MAX_AGE_SECONDS * 1000,
  });
  cookieStore.set(SESSION_COOKIE_NAME, sessionId, sessionCookieOptions());

  return sessionId;
}

export async function verifyCaptchaInput(token: string) {
  if (!token) {
    throw new ValidationError("Captcha wajib diisi", {
      captchaInput: ["Silakan centang verifikasi captcha terlebih dahulu."],
    });
  }

  try {
    const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `secret=${env.RECAPTCHA_SECRET_KEY}&response=${token}`,
    });

    const data = await response.json();

    if (!data.success) {
      throw new ValidationError("Validasi captcha gagal", {
        captchaInput: ["Captcha tidak valid atau sudah kedaluwarsa. Silakan muat ulang halaman."],
      });
    }
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    throw new ValidationError("Gagal terhubung ke layanan Captcha", {
      captchaInput: ["Terjadi kesalahan sistem saat memvalidasi captcha."],
    });
  }
}

export async function createAuthSession(user: SessionUser) {
  const sessionId = await getOrCreateSessionId();
  const session = sessions.get(sessionId);

  if (!session) {
    throw new UnauthorizedError("Invalid session");
  }

  session.user = user;
  session.expiresAt = Date.now() + SESSION_MAX_AGE_SECONDS * 1000;
  sessions.set(sessionId, session);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, sessionId, sessionCookieOptions());
}

export async function getSessionUser() {
  cleanupExpiredSessions();

  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionId) {
    throw new UnauthorizedError("Unauthorized");
  }

  const session = sessions.get(sessionId);

  if (!session?.user || session.expiresAt <= Date.now()) {
    throw new UnauthorizedError("Unauthorized");
  }

  return session.user;
}

export async function destroySession() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (sessionId) {
    sessions.delete(sessionId);
  }

  cookieStore.delete(SESSION_COOKIE_NAME);
  cookieStore.delete("access_token");
  cookieStore.delete("refresh_token");
}
