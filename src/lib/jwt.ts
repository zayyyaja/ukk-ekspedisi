import { jwtVerify, SignJWT } from "jose";

import type { AuthUser, TokenType } from "@/types/auth";

export type JwtPayload = AuthUser & {
  sub: string;
  tokenUse: TokenType;
};

const ACCESS_TOKEN_EXPIRES_IN = "15m";
const REFRESH_TOKEN_EXPIRES_IN = "7d";

function getSecret(value: string | undefined, name: string) {
  if (!value) {
    throw new Error(`${name} is not configured`);
  }

  return new TextEncoder().encode(value);
}

function accessSecret() {
  return getSecret(process.env.JWT_ACCESS_SECRET, "JWT_ACCESS_SECRET");
}

function refreshSecret() {
  return getSecret(process.env.JWT_REFRESH_SECRET, "JWT_REFRESH_SECRET");
}

async function signToken(payload: JwtPayload, secret: Uint8Array, expiresIn: string) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secret);
}

export function signAccessToken(user: AuthUser) {
  return signToken(
    {
      ...user,
      sub: user.sub,
      tokenUse: "access",
    },
    accessSecret(),
    ACCESS_TOKEN_EXPIRES_IN,
  );
}

export function signRefreshToken(user: AuthUser) {
  return signToken(
    {
      ...user,
      sub: user.sub,
      tokenUse: "refresh",
    },
    refreshSecret(),
    REFRESH_TOKEN_EXPIRES_IN,
  );
}

async function verifyToken(token: string, secret: Uint8Array, expectedType: TokenType) {
  const { payload } = await jwtVerify<JwtPayload>(token, secret);

  if (payload.tokenUse !== expectedType) {
    throw new Error("Invalid token type");
  }

  return payload;
}

export function verifyAccessToken(token: string) {
  return verifyToken(token, accessSecret(), "access");
}

export function verifyRefreshToken(token: string) {
  return verifyToken(token, refreshSecret(), "refresh");
}
