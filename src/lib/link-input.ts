import { charCount } from "./messages";

export const LINK_TITLE_MAX = 30;
export const LINK_URL_MAX = 2000;
export const LINK_EMOJI_MAX = 8;
export const DEFAULT_EMOJI = "🔗";

type LinkInputResult =
  | { ok: true; title: string; url: string; emoji: string }
  | { ok: false; error: string };

export function validateLinkInput(title: unknown, url: unknown, emoji: unknown): LinkInputResult {
  if (typeof title !== "string" || typeof url !== "string") {
    return { ok: false, error: "제목과 주소를 입력해 주세요." };
  }

  const t = title.trim();
  const u = url.trim();
  const e = typeof emoji === "string" && emoji.trim() ? emoji.trim() : DEFAULT_EMOJI;

  if (!t) return { ok: false, error: "제목을 입력해 주세요." };
  if (charCount(t) > LINK_TITLE_MAX) {
    return { ok: false, error: `제목은 ${LINK_TITLE_MAX}자 이하로 입력해 주세요.` };
  }
  if (charCount(e) > LINK_EMOJI_MAX) {
    return { ok: false, error: "이모지는 하나만 입력해 주세요." };
  }
  if (!u) return { ok: false, error: "주소를 입력해 주세요." };
  if (u.length > LINK_URL_MAX) return { ok: false, error: "주소가 너무 깁니다." };

  // javascript: 같은 주소가 링크로 들어가지 않도록 http(s)만 허용
  let parsed: URL;
  try {
    parsed = new URL(u);
  } catch {
    return { ok: false, error: "https://로 시작하는 올바른 주소를 입력해 주세요." };
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    return { ok: false, error: "http:// 또는 https://로 시작하는 주소만 쓸 수 있어요." };
  }

  return { ok: true, title: t, url: parsed.href, emoji: e };
}
