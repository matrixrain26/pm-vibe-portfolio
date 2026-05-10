import { cookies } from "next/headers";

const COOKIE_NAME = "pm_portfolio_admin";

function secret() {
  return process.env.SESSION_SECRET || "local-development-secret-change-me";
}

async function sign(value: string) {
  const data = new TextEncoder().encode(`${value}.${secret()}`);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function createSession() {
  const value = crypto.randomUUID();
  const signature = await sign(value);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, `${value}.${signature}`, {
    httpOnly: true,
    maxAge: 60 * 60 * 8,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production"
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function isAuthenticated() {
  const cookieStore = await cookies();
  const raw = cookieStore.get(COOKIE_NAME)?.value;
  if (!raw) return false;

  const [value, signature] = raw.split(".");
  if (!value || !signature) return false;
  return (await sign(value)) === signature;
}

export function isValidPassword(password: string) {
  const configured = process.env.ADMIN_PASSWORD || (process.env.NODE_ENV === "development" ? "admin123" : "");
  return password === configured;
}
