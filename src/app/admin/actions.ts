"use server";

import { ObjectId } from "mongodb";
import { refresh } from "next/cache";
import { cookies, headers } from "next/headers";
import {
  ADMIN_COOKIE,
  SESSION_MAX_AGE,
  checkPassword,
  createSessionToken,
  isAdmin,
  isAdminConfigured,
} from "@/lib/admin-auth";
import type { MessageDoc } from "@/lib/messages";
import { getDb } from "@/lib/mongodb";
import { clientKey, isRateLimited, recordHit } from "@/lib/rate-limit";

const LOGIN_FAIL_LIMIT = 5; // 같은 IP에서 15분에 5번 틀리면 잠금
const LOGIN_FAIL_WINDOW_MS = 15 * 60 * 1000;

export type LoginState = { error?: string };

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  if (!isAdminConfigured()) {
    return { error: "ADMIN_PASSWORD 환경변수가 설정되지 않았습니다." };
  }

  const db = await getDb();
  if (!db) return { error: "데이터베이스에 연결할 수 없습니다." };

  const key = `admin-login:${clientKey(await headers())}`;
  if (await isRateLimited(db, key, LOGIN_FAIL_LIMIT, LOGIN_FAIL_WINDOW_MS)) {
    return { error: "로그인 시도가 너무 많아요. 15분 뒤에 다시 시도해 주세요." };
  }

  const password = formData.get("password");
  if (typeof password !== "string" || !checkPassword(password)) {
    await recordHit(db, key);
    return { error: "비밀번호가 올바르지 않습니다." };
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  refresh();
  return {};
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE);
  refresh();
}

/** 화면에 버튼이 보이는지와 상관없이, 모든 관리자 동작은 서버에서 세션을 다시 확인 */
async function getAdminCollection() {
  if (!(await isAdmin())) throw new Error("관리자 인증이 필요합니다.");
  const db = await getDb();
  if (!db) throw new Error("데이터베이스에 연결할 수 없습니다.");
  return db.collection<MessageDoc>("messages");
}

function parseId(formData: FormData) {
  const id = formData.get("id");
  if (typeof id !== "string" || !ObjectId.isValid(id)) throw new Error("잘못된 메시지 ID입니다.");
  return new ObjectId(id);
}

export async function approveMessage(formData: FormData) {
  const messages = await getAdminCollection();
  await messages.updateOne(
    { _id: parseId(formData) },
    { $set: { status: "approved", approvedAt: new Date() } },
  );
  refresh();
}

export async function deleteMessage(formData: FormData) {
  const messages = await getAdminCollection();
  await messages.deleteOne({ _id: parseId(formData) });
  refresh();
}
