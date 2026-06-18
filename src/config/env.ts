import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(1),
  JWT_REFRESH_SECRET: z.string().min(1),
  MIDTRANS_SERVER_KEY: z.string().min(1),
  MIDTRANS_CLIENT_KEY: z.string().min(1),
  TURNSTILE_SECRET_KEY: z.string().min(1),
});

export function validateEnv() {
  return envSchema.parse(process.env);
}

export function validateProductionEnv() {
  if (process.env.NODE_ENV !== "production") {
    return null;
  }

  return validateEnv();
}
