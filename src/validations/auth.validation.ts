import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .regex(/[A-Za-z]/, "Password must contain at least one letter.")
  .regex(/\d/, "Password must contain at least one number.");

export const customerRegisterSchema = z
  .object({
    name: z.string().min(2).max(50),
    email: z.string().email(),
    password: passwordSchema,
    passwordConfirmation: z.string(),
    address: z.string().min(1),
    city: z.string().min(1),
    phone: z.string().min(1),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "Password confirmation does not match.",
    path: ["passwordConfirmation"],
  });

export const customerLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  captchaInput: z.string().min(1),
});

export const staffLoginSchema = customerLoginSchema;

export const verifyEmailSchema = z.object({
  token: z.string().min(1),
});

export const resendVerificationSchema = customerRegisterSchema;

export type CustomerRegisterInput = z.infer<typeof customerRegisterSchema>;
export type CustomerLoginInput = z.infer<typeof customerLoginSchema>;
export type StaffLoginInput = z.infer<typeof staffLoginSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
export type ResendVerificationInput = z.infer<typeof resendVerificationSchema>;