import { jwtVerify, SignJWT } from "jose";

export type CustomerRegistrationVerificationPayload = {
  type: "customer_registration_verification";
  name: string;
  email: string;
  passwordHash: string;
  address: string;
  city: string;
  phone: string;
};

const TOKEN_EXPIRES_IN = "1h";
export const EMAIL_VERIFICATION_EXPIRES_IN_SECONDS = 3600;

function getEmailVerificationSecret() {
  const secret = process.env.JWT_EMAIL_VERIFICATION_SECRET;

  if (!secret) {
    throw new Error("JWT_EMAIL_VERIFICATION_SECRET is not configured");
  }

  return new TextEncoder().encode(secret);
}

export function signCustomerRegistrationVerificationToken(
  payload: CustomerRegistrationVerificationPayload,
) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRES_IN)
    .sign(getEmailVerificationSecret());
}

export async function verifyCustomerRegistrationVerificationToken(token: string) {
  const { payload } = await jwtVerify<CustomerRegistrationVerificationPayload>(
    token,
    getEmailVerificationSecret(),
  );

  if (
    payload.type !== "customer_registration_verification" ||
    !payload.name ||
    !payload.email ||
    !payload.passwordHash ||
    !payload.address ||
    !payload.city ||
    !payload.phone
  ) {
    throw new Error("Invalid verification token");
  }

  return payload;
}