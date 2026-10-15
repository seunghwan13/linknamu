"use server";

import { ObjectId } from "mongodb";
import { refresh, updateTag } from "next/cache";
import { cookies, headers } from "next/headers";
import {
  ADMIN_COOKIE,
  SESSION_MAX_AGE,
  checkPassword,
  createSessionToken,
  isAdmin,
  isAdminConfigured,
} from "@/lib/admin-auth";
import { validateLinkInput } from "@/lib/link-input";
import { LINKS_TAG, loadLinks, newLinkId, saveLinks } from "@/lib/links";
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
async function getAdminDb() {
  if (!(await isAdmin())) throw new Error("관리자 인증이 필요합니다.");
  const db = await getDb();
  if (!db) throw new Error("데이터베이스에 연결할 수 없습니다.");
  return db;
}

async function getAdminCollection() {
  return (await getAdminDb()).collection<MessageDoc>("messages");
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

export type LinkFormState = {
  error?: string;
  /** 오류가 났을 때 입력한 값을 다시 채워 넣기 위해 돌려줌 */
  values?: { title: string; url: string; emoji: string };
  /** 저장에 성공할 때마다 바뀌는 값 (폼 닫기·초기화 신호) */
  savedAt?: number;
};

function formText(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

/** id가 있으면 해당 링크를 수정, 없으면 맨 아래에 새 링크 추가 */
export async function saveLink(_prev: LinkFormState, formData: FormData): Promise<LinkFormState> {
  const db = await getAdminDb();
  const values = {
    title: formText(formData, "title"),
    url: formText(formData, "url"),
    emoji: formText(formData, "emoji"),
  };

  const input = validateLinkInput(values.title, values.url, values.emoji);
  if (!input.ok) return { error: input.error, values };

  const links = await loadLinks(db);
  const id = formText(formData, "id");
  const link = { title: input.title, url: input.url, emoji: input.emoji };

  if (id) {
    const index = links.findIndex((item) => item.id === id);
    if (index === -1) return { error: "이미 삭제된 링크입니다.", values };
    links[index] = { ...links[index], ...link };
  } else {
    links.push({ id: newLinkId(links), ...link });
  }

  await saveLinks(db, links);
  updateTag(LINKS_TAG);
  refresh();
  return { savedAt: Date.now() };
}

export async function deleteLink(formData: FormData) {
  const db = await getAdminDb();
  const id = formText(formData, "id");
  const links = await loadLinks(db);

  await saveLinks(db, links.filter((link) => link.id !== id));
  updateTag(LINKS_TAG);
  refresh();
}

export async function moveLink(formData: FormData) {
  const db = await getAdminDb();
  const id = formText(formData, "id");
  const offset = formText(formData, "direction") === "up" ? -1 : 1;

  const links = await loadLinks(db);
  const from = links.findIndex((link) => link.id === id);
  const to = from + offset;
  if (from === -1 || to < 0 || to >= links.length) return;

  [links[from], links[to]] = [links[to], links[from]];
  await saveLinks(db, links);
  updateTag(LINKS_TAG);
  refresh();
}
