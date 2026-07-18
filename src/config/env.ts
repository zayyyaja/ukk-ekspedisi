import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  APP_URL: z.string().url().default("http://localhost:3000"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is missing"),
  JWT_ACCESS_SECRET: z.string().min(1, "JWT_ACCESS_SECRET is missing"),
  JWT_REFRESH_SECRET: z.string().min(1, "JWT_REFRESH_SECRET is missing"),
  JWT_EMAIL_VERIFICATION_SECRET: z.string().min(1, "JWT_EMAIL_VERIFICATION_SECRET is missing"),
  RECAPTCHA_SECRET_KEY: z.string().min(1, "RECAPTCHA_SECRET_KEY is missing"),
  NEXT_PUBLIC_RECAPTCHA_SITE_KEY: z.string().min(1, "NEXT_PUBLIC_RECAPTCHA_SITE_KEY is missing"),
  MIDTRANS_SERVER_KEY: z.string().min(1, "MIDTRANS_SERVER_KEY is missing"),
  MIDTRANS_CLIENT_KEY: z.string().min(1, "MIDTRANS_CLIENT_KEY is missing"),
  MIDTRANS_IS_PRODUCTION: z.string().transform((val) => val === "true"),
  SMTP_HOST: z.string().min(1, "SMTP_HOST is missing"),
  SMTP_PORT: z.coerce.number().min(1, "SMTP_PORT must be a valid port number"),
  SMTP_USER: z.string().min(1, "SMTP_USER is missing"),
  SMTP_PASS: z.string().min(1, "SMTP_PASS is missing"),
  MAILTRAP_FROM: z.string().min(1, "MAILTRAP_FROM is missing"),
});

export const env = envSchema.parse(process.env);

export function validateEnv() {
  return env;
}

export function validateProductionEnv() {
  if (process.env.NODE_ENV !== "production") {
    return null;
  }
  return validateEnv();
}
