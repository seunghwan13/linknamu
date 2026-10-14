import type { ObjectId } from "mongodb";

export const NICKNAME_MAX = 20;
export const MESSAGE_MAX = 300;

export type MessageStatus = "pending" | "approved";

export type MessageDoc = {
  _id: ObjectId;
  nickname: string;
  message: string;
  status: MessageStatus;
  createdAt: Date;
  approvedAt?: Date;
};

/** 클라이언트에 내려주는 공개용 메시지 */
export type PublicMessage = {
  id: string;
  nickname: string;
  message: string;
  createdAt: string;
};

/** 글자 수는 이모지 등을 한 글자로 세기 위해 코드 포인트 기준으로 계산 */
export function charCount(value: string) {
  return [...value].length;
}

type ValidationResult =
  | { ok: true; nickname: string; message: string }
  | { ok: false; error: string };

export function validateMessageInput(nickname: unknown, message: unknown): ValidationResult {
  if (typeof nickname !== "string" || typeof message !== "string") {
    return { ok: false, error: "닉네임과 메시지를 입력해 주세요." };
  }

  const n = nickname.trim();
  const m = message.trim();

  if (!n) return { ok: false, error: "닉네임을 입력해 주세요." };
  if (!m) return { ok: false, error: "메시지를 입력해 주세요." };
  if (charCount(n) > NICKNAME_MAX) {
    return { ok: false, error: `닉네임은 ${NICKNAME_MAX}자 이하로 입력해 주세요.` };
  }
  if (charCount(m) > MESSAGE_MAX) {
    return { ok: false, error: `메시지는 ${MESSAGE_MAX}자 이하로 입력해 주세요.` };
  }

  return { ok: true, nickname: n, message: m };
}
