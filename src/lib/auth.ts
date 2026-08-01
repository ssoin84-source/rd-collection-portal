import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const encodedSecret = () =>
  new TextEncoder().encode(process.env.AUTH_SECRET || "dev-secret-change-me");

export type SessionPayload =
  | { role: "admin" }
  | { role: "customer"; loginId: string; username: string; accountIds: string[] };

const COOKIE_NAME = "rd_session";
const MAX_AGE_SECONDS = 60 * 60 * 8; // 8 hour session

export async function createSession(payload: SessionPayload) {
  const token = await new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(encodedSecret());

  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: MAX_AGE_SECONDS,
    path: "/",
  });
}

export async function destroySession() {
  cookies().delete(COOKIE_NAME);
}

export async function getSession(): Promise<SessionPayload | null> {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, encodedSecret());
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function requireAdmin(): Promise<boolean> {
  const session = await getSession();
  return !!session && session.role === "admin";
}

export async function requireCustomer(): Promise<Extract<SessionPayload, { role: "customer" }> | null> {
  const session = await getSession();
  if (session && session.role === "customer") return session;
  return null;
}

export { COOKIE_NAME };
