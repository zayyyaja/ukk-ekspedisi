import { jwtVerify, SignJWT } from "jose";

import {
  clearCustomerRememberToken,
  clearStaffRememberToken,
  createCustomer,
  findCustomerByEmail,
  findCustomerById,
  findStaffByEmail,
  findStaffById,
  updateCustomerRememberToken,
  updateCustomerVerification,
  updateStaffRememberToken,
} from "@/repositories/auth.repository";
import type {
  CustomerLoginInput,
  CustomerRegisterInput,
  ResendVerificationInput,
  StaffLoginInput,
  VerifyEmailInput,
} from "@/validations/auth.validation";
import { verifyCaptcha } from "@/lib/captcha";
import { comparePassword, hashPassword } from "@/lib/password";
import {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  type JwtPayload,
} from "@/lib/jwt";
import { buildVerificationLink, sendVerificationEmail } from "@/lib/email";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "@/lib/errors";
import type { AuthUser } from "@/types/auth";

type EmailVerificationPayload = {
  type: "customer_email_verification";
  email: string;
};

function tokenSecret() {
  const secret = process.env.JWT_ACCESS_SECRET;

  if (!secret) {
    throw new Error("JWT_ACCESS_SECRET is not configured");
  }

  return new TextEncoder().encode(secret);
}

function toBigIntId(id: string) {
  try {
    return BigInt(id);
  } catch {
    throw new UnauthorizedError("Invalid session");
  }
}

function toNumberId(id: bigint) {
  return Number(id);
}

function sanitizeCustomer(customer: {
  id: bigint;
  name: string;
  email: string;
  is_verified: boolean;
  email_verified_at: Date | null;
}) {
  return {
    id: toNumberId(customer.id),
    name: customer.name,
    email: customer.email,
    isVerified: customer.is_verified,
    emailVerifiedAt: customer.email_verified_at,
    type: "customer" as const,
    role: "customer" as const,
    branchId: null,
  };
}

function sanitizeStaff(staff: {
  id: bigint;
  name: string;
  email: string;
  role: "admin" | "cashier" | "courier" | "manager";
  branch_id: bigint | null;
  is_active: boolean;
  email_verified_at: Date | null;
}) {
  return {
    id: toNumberId(staff.id),
    name: staff.name,
    email: staff.email,
    role: staff.role,
    branchId: staff.branch_id ? toNumberId(staff.branch_id) : null,
    isActive: staff.is_active,
    emailVerifiedAt: staff.email_verified_at,
    type: "staff" as const,
  };
}

function customerAuthUser(customer: {
  id: bigint;
  name: string;
  email: string;
}): AuthUser {
  return {
    sub: customer.id.toString(),
    id: toNumberId(customer.id),
    type: "customer",
    role: "customer",
    branchId: null,
    email: customer.email,
    name: customer.name,
  };
}

function staffAuthUser(staff: {
  id: bigint;
  name: string;
  email: string;
  role: "admin" | "cashier" | "courier" | "manager";
  branch_id: bigint | null;
}): AuthUser {
  return {
    sub: staff.id.toString(),
    id: toNumberId(staff.id),
    type: "staff",
    role: staff.role,
    branchId: staff.branch_id ? toNumberId(staff.branch_id) : null,
    email: staff.email,
    name: staff.name,
  };
}

async function validateCaptchaOrThrow(captchaToken: string) {
  const captcha = await verifyCaptcha(captchaToken);

  if (!captcha.success) {
    throw new ValidationError("Captcha verification failed", {
      captchaToken: captcha.errors,
    });
  }
}

async function generateEmailVerificationToken(email: string) {
  return new SignJWT({
    type: "customer_email_verification",
    email,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(tokenSecret());
}

async function verifyEmailVerificationToken(token: string) {
  const { payload } = await jwtVerify<EmailVerificationPayload>(
    token,
    tokenSecret(),
  );

  if (payload.type !== "customer_email_verification" || !payload.email) {
    throw new UnauthorizedError("Invalid verification token");
  }

  return payload;
}

async function issueSession(user: AuthUser) {
  const accessToken = await signAccessToken(user);
  const refreshToken = await signRefreshToken(user);
  const hashedRefreshToken = await hashPassword(refreshToken);

  if (user.type === "customer") {
    await updateCustomerRememberToken(toBigIntId(user.sub), hashedRefreshToken);
  } else {
    await updateStaffRememberToken(toBigIntId(user.sub), hashedRefreshToken);
  }

  return {
    accessToken,
    refreshToken,
  };
}

export async function registerCustomer(input: CustomerRegisterInput) {
  await validateCaptchaOrThrow(input.captchaToken);

  const existingCustomer = await findCustomerByEmail(input.email);

  if (existingCustomer) {
    throw new ConflictError("Email already registered");
  }

  const hashedPassword = await hashPassword(input.password);
  const customer = await createCustomer({
    name: input.name,
    email: input.email,
    password: hashedPassword,
    address: input.address,
    city: input.city,
    phone: input.phone,
  });
  const verificationToken = await generateEmailVerificationToken(customer.email);
  const verificationLink = buildVerificationLink(verificationToken);
  const email = await sendVerificationEmail({
    to: customer.email,
    name: customer.name,
    verificationLink,
  });

  return {
    customer: sanitizeCustomer(customer),
    verificationLink: email.verificationLink,
  };
}

export async function loginCustomer(input: CustomerLoginInput) {
  await validateCaptchaOrThrow(input.captchaToken);

  const customer = await findCustomerByEmail(input.email);

  if (!customer) {
    throw new UnauthorizedError("Invalid email or password");
  }

  const passwordMatches = await comparePassword(input.password, customer.password);

  if (!passwordMatches) {
    throw new UnauthorizedError("Invalid email or password");
  }

  if (!customer.is_verified || !customer.email_verified_at) {
    throw new ForbiddenError("Please verify your email before login");
  }

  const session = await issueSession(customerAuthUser(customer));

  return {
    user: sanitizeCustomer(customer),
    ...session,
  };
}

export async function loginStaff(input: StaffLoginInput) {
  await validateCaptchaOrThrow(input.captchaToken);

  const staff = await findStaffByEmail(input.email);

  if (!staff) {
    throw new UnauthorizedError("Invalid email or password");
  }

  if (!staff.is_active) {
    throw new ForbiddenError("Staff account is inactive");
  }

  if (!staff.email_verified_at) {
    throw new ForbiddenError("Staff email is not verified");
  }

  const passwordMatches = await comparePassword(input.password, staff.password);

  if (!passwordMatches) {
    throw new UnauthorizedError("Invalid email or password");
  }

  const session = await issueSession(staffAuthUser(staff));

  return {
    user: sanitizeStaff(staff),
    ...session,
  };
}

export async function verifyCustomerEmail(input: VerifyEmailInput) {
  const payload = await verifyEmailVerificationToken(input.token);
  const customer = await findCustomerByEmail(payload.email);

  if (!customer) {
    throw new NotFoundError("Customer not found");
  }

  const verifiedCustomer = await updateCustomerVerification(customer.id);

  return sanitizeCustomer(verifiedCustomer);
}

export async function resendVerificationEmail(input: ResendVerificationInput) {
  await validateCaptchaOrThrow(input.captchaToken);

  const customer = await findCustomerByEmail(input.email);

  if (!customer || customer.is_verified) {
    return {
      verificationLink: null,
    };
  }

  const verificationToken = await generateEmailVerificationToken(customer.email);
  const verificationLink = buildVerificationLink(verificationToken);
  const email = await sendVerificationEmail({
    to: customer.email,
    name: customer.name,
    verificationLink,
  });

  return {
    verificationLink: email.verificationLink,
  };
}

async function getSessionUser(payload: JwtPayload) {
  if (payload.type === "customer") {
    const customer = await findCustomerById(toBigIntId(payload.sub));

    if (!customer) {
      throw new UnauthorizedError("Invalid session");
    }

    return {
      record: customer,
      user: sanitizeCustomer(customer),
      authUser: customerAuthUser(customer),
    };
  }

  const staff = await findStaffById(toBigIntId(payload.sub));

  if (!staff || !staff.is_active) {
    throw new UnauthorizedError("Invalid session");
  }

  return {
    record: staff,
    user: sanitizeStaff(staff),
    authUser: staffAuthUser(staff),
  };
}

export async function refreshSession(refreshToken: string | null) {
  if (!refreshToken) {
    throw new UnauthorizedError("Refresh token is missing");
  }

  const payload = await verifyRefreshToken(refreshToken);
  const sessionUser = await getSessionUser(payload);
  const rememberedToken = sessionUser.record.remember_token;

  if (!rememberedToken) {
    throw new UnauthorizedError("Invalid session");
  }

  const tokenMatches = await comparePassword(refreshToken, rememberedToken);

  if (!tokenMatches) {
    throw new UnauthorizedError("Invalid session");
  }

  const session = await issueSession(sessionUser.authUser);

  return {
    user: sessionUser.user,
    ...session,
  };
}

export async function getCurrentUser(accessToken: string | null) {
  if (!accessToken) {
    throw new UnauthorizedError("Access token is missing");
  }

  const payload = await verifyAccessToken(accessToken);
  const sessionUser = await getSessionUser(payload);

  return sessionUser.user;
}

export async function logout(accessToken: string | null, refreshToken: string | null) {
  const token = accessToken ?? refreshToken;

  if (!token) {
    return;
  }

  const payload = accessToken
    ? await verifyAccessToken(accessToken)
    : await verifyRefreshToken(token);

  if (payload.type === "customer") {
    await clearCustomerRememberToken(toBigIntId(payload.sub));
    return;
  }

  await clearStaffRememberToken(toBigIntId(payload.sub));
}
