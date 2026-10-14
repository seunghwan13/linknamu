import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "admin_session";
export const SESSION_MAX_AGE = 60 * 60 * 12; // 12시간

function getPassword() {
  return process.env.ADMIN_PASSWORD || null;
}

export function isAdminConfigured() {
  return getPassword() !== null;
}

function safeEqual(a: string, b: string) {
  // 길이가 달라도 같은 시간에 비교하도록 해시 후 비교
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

export function checkPassword(input: string) {
  const password = getPassword();
  return password !== null && safeEqual(input, password);
}

function sign(payload: string, password: string) {
  return createHmac("sha256", password).update(`admin:${payload}`).digest("base64url");
}

/** 만료시각.서명 형태의 세션 토큰. 비밀번호를 바꾸면 기존 세션은 모두 무효화됨 */
export function createSessionToken() {
  const password = getPassword();
  if (!password) throw new Error("ADMIN_PASSWORD가 설정되지 않았습니다.");
  const expiresAt = String(Date.now() + SESSION_MAX_AGE * 1000);
  return `${expiresAt}.${sign(expiresAt, password)}`;
}

function verifySessionToken(token: string | undefined) {
  const password = getPassword();
  if (!password || !token) return false;

  const [expiresAt, signature] = token.split(".");
  if (!expiresAt || !signature) return false;
  if (!(Number(expiresAt) > Date.now())) return false;

  return safeEqual(signature, sign(expiresAt, password));
}

export async function isAdmin() {
  const cookieStore = await cookies();
  return verifySessionToken(cookieStore.get(ADMIN_COOKIE)?.value);
}
