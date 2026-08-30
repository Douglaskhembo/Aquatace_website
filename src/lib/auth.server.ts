import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";

const TOKEN_EXPIRY = "7d";

function getSecretKey(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("Missing JWT_SECRET environment variable.");
  return new TextEncoder().encode(secret);
}

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export interface AdminClaims {
  sub: string;
  email: string;
}

export async function signAdminToken(claims: AdminClaims): Promise<string> {
  return new SignJWT({ email: claims.email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(claims.sub)
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(getSecretKey());
}

export async function verifyAdminToken(token: string): Promise<AdminClaims | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (!payload.sub || typeof payload.email !== "string") return null;
    return { sub: payload.sub, email: payload.email };
  } catch {
    return null;
  }
}
