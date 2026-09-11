import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/lib/sessionCookie";

export { SESSION_COOKIE };
const SESSION_TTL_SECONDS = 60 * 60 * 12; // 12h

function getSecretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error(
      "SESSION_SECRET manquant ou trop court. Définis une valeur aléatoire longue dans .env (voir .env.example)."
    );
  }
  return new TextEncoder().encode(secret);
}

export async function createSessionToken() {
  return await new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(getSecretKey());
}

export async function verifySessionToken(token) {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (payload.role !== "admin") return null;
    return payload;
  } catch {
    return null;
  }
}

/** À utiliser dans les Server Components / route handlers pour lire la session courante. */
export async function getAdminSession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function setSessionCookie(token) {
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export const PASSWORD_MIN_LENGTH = 10;

/** Règles de robustesse minimales exigées pour le mot de passe admin (cahier des charges §2.1). */
export function validatePassword(password, { forbidden = [] } = {}) {
  if (typeof password !== "string" || password.length < PASSWORD_MIN_LENGTH) {
    return `Le mot de passe doit contenir au moins ${PASSWORD_MIN_LENGTH} caractères.`;
  }
  if (!/[a-zA-ZÀ-ÿ]/.test(password) || !/[0-9]/.test(password)) {
    return "Le mot de passe doit contenir au moins une lettre et un chiffre.";
  }
  if (forbidden.some((f) => f && password === f)) {
    return "Ce mot de passe ne peut pas être la valeur par défaut.";
  }
  return null;
}
