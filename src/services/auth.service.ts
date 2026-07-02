import {
  createVerifiedCustomer,
  findCustomerByEmail,
  findCustomerById,
  findStaffByEmail,
  findStaffById,
} from "@/repositories/auth.repository";
import type {
  CustomerLoginInput,
  CustomerRegisterInput,
  ResendVerificationInput,
  StaffLoginInput,
  VerifyEmailInput,
} from "@/validations/auth.validation";
import { comparePassword, hashPassword } from "@/lib/password";
import { buildVerificationLink, sendVerificationEmail } from "@/lib/email";
import {
  ConflictError,
  ForbiddenError,
  UnauthorizedError,
  ValidationError,
} from "@/lib/errors";
import {
  EMAIL_VERIFICATION_EXPIRES_IN_SECONDS,
  signCustomerRegistrationVerificationToken,
  verifyCustomerRegistrationVerificationToken,
} from "@/lib/email-verification-token";
import type { AuthUser } from "@/types/auth";
import type { SessionUser } from "@/lib/session";

function toBigIntId(id: string | number) {
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
  email: string | null;
  email_verified_at: Date | null;
}) {
  if (!customer.email) {
    throw new UnauthorizedError("Customer belum memiliki akses login.");
  }

  return {
    id: toNumberId(customer.id),
    name: customer.name,
    email: customer.email,
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
  role: "admin" | "cashier" | "courier" | "manager" | "owner";
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

function toCustomerSession(customer: { id: bigint; email: string | null }): SessionUser {
  if (!customer.email) {
    throw new UnauthorizedError("Customer belum memiliki akses login.");
  }

  return {
    userId: toNumberId(customer.id),
    type: "customer",
    role: "customer",
    email: customer.email,
  };
}

function toStaffSession(staff: {
  id: bigint;
  email: string;
  role: "admin" | "cashier" | "courier" | "manager" | "owner";
}): SessionUser {
  return {
    userId: toNumberId(staff.id),
    type: "staff",
    role: staff.role,
    email: staff.email,
  };
}

async function sendRegistrationVerification(input: CustomerRegisterInput) {
  const existingCustomer = await findCustomerByEmail(input.email);

  if (existingCustomer) {
    throw new ConflictError("Email already registered");
  }

  const passwordHash = await hashPassword(input.password);
  const token = await signCustomerRegistrationVerificationToken({
    type: "customer_registration_verification",
    name: input.name,
    email: input.email,
    passwordHash,
    address: input.address,
    city: input.city,
    phone: input.phone,
  });
  const verificationLink = buildVerificationLink(token);

  await sendVerificationEmail({
    to: input.email,
    name: input.name,
    verificationLink,
  });

  return {
    email: input.email,
    expiresIn: EMAIL_VERIFICATION_EXPIRES_IN_SECONDS,
  };
}

export async function registerCustomer(input: CustomerRegisterInput) {
  return sendRegistrationVerification(input);
}

export async function loginCustomer(input: CustomerLoginInput) {
  const customer = await findCustomerByEmail(input.email);

  if (!customer) {
    throw new UnauthorizedError("Invalid email or password");
  }

  if (!customer.email || !customer.password) {
    throw new UnauthorizedError("Invalid email or password");
  }

  const passwordMatches = await comparePassword(input.password, customer.password);

  if (!passwordMatches) {
    throw new UnauthorizedError("Invalid email or password");
  }

  if (!customer.email_verified_at) {
    throw new ForbiddenError("Silakan verifikasi email terlebih dahulu.");
  }

  return {
    user: sanitizeCustomer(customer),
    session: toCustomerSession(customer),
  };
}

export async function loginStaff(input: StaffLoginInput) {
  const staff = await findStaffByEmail(input.email);

  if (!staff) {
    throw new UnauthorizedError("Invalid email or password");
  }

  if (!staff.is_active) {
    throw new ForbiddenError("Staff account is inactive");
  }

  const passwordMatches = await comparePassword(input.password, staff.password);

  if (!passwordMatches) {
    throw new UnauthorizedError("Invalid email or password");
  }

  return {
    user: sanitizeStaff(staff),
    session: toStaffSession(staff),
  };
}

export async function verifyCustomerEmail(input: VerifyEmailInput) {
  let payload;

  try {
    payload = await verifyCustomerRegistrationVerificationToken(input.token);
  } catch {
    throw new ValidationError("Token verifikasi tidak valid atau sudah kedaluwarsa", {
      token: ["Token verifikasi tidak valid atau sudah kedaluwarsa."],
    });
  }

  const existingCustomer = await findCustomerByEmail(payload.email);

  if (existingCustomer) {
    throw new ConflictError("Email already verified or registered");
  }

  await createVerifiedCustomer({
    name: payload.name,
    email: payload.email,
    password: payload.passwordHash,
    address: payload.address,
    city: payload.city,
    phone: payload.phone,
  });

  return null;
}

export async function resendVerificationEmail(input: ResendVerificationInput) {
  return sendRegistrationVerification(input);
}

export async function getCurrentUser(session: SessionUser): Promise<AuthUser> {
  if (session.type === "customer") {
    const customer = await findCustomerById(toBigIntId(session.userId));

    if (!customer || !customer.email || !customer.email_verified_at) {
      throw new UnauthorizedError();
    }

    return {
      sub: customer.id.toString(),
      id: toNumberId(customer.id),
      type: "customer",
      role: "customer",
      branchId: null,
      email: customer.email,
      name: customer.name,
      phone: customer.phone,
      city: customer.city,
      address: customer.address,
      photo: customer.photo,
    };
  }

  const staff = await findStaffById(toBigIntId(session.userId));

  if (!staff || !staff.is_active) {
    throw new UnauthorizedError();
  }

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
