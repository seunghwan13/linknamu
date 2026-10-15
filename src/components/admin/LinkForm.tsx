"use client";

import { useActionState, useEffect } from "react";
import { saveLink, type LinkFormState } from "@/app/admin/actions";
import type { LinkItem } from "@/data/profile";
import { DEFAULT_EMOJI, LINK_TITLE_MAX, LINK_URL_MAX } from "@/lib/link-input";

type Props = {
  /** 없으면 새 링크 추가 폼 */
  link?: LinkItem;
  onSaved?: () => void;
  onCancel?: () => void;
};

export default function LinkForm({ link, onSaved, onCancel }: Props) {
  const [state, action, pending] = useActionState<LinkFormState, FormData>(saveLink, {});

  useEffect(() => {
    if (state.savedAt) onSaved?.();
  }, [state.savedAt, onSaved]);

  // 제출 후 React가 폼을 초기화하므로, 오류가 나면 입력했던 값으로 다시 채움
  const values = state.values ?? link;

  return (
    <form action={action} className="flex flex-col gap-3">
      {link && <input type="hidden" name="id" value={link.id} />}
      <div className="flex gap-2">
        <input
          name="emoji"
          defaultValue={values?.emoji ?? ""}
          placeholder={DEFAULT_EMOJI}
          aria-label="이모지"
          className="glass-input w-16 text-center"
        />
        <input
          name="title"
          defaultValue={values?.title ?? ""}
          required
          maxLength={LINK_TITLE_MAX}
          placeholder="제목 (예: Instagram)"
          aria-label="제목"
          className="glass-input min-w-0 flex-1"
        />
      </div>
      <input
        name="url"
        type="url"
        defaultValue={values?.url ?? ""}
        required
        maxLength={LINK_URL_MAX}
        placeholder="https://"
        aria-label="주소"
        className="glass-input"
      />
      {state.error && (
        <p role="alert" className="text-sm text-rose-500">
          {state.error}
        </p>
      )}
      <div className="flex gap-2">
        <button type="submit" disabled={pending} className="glass-button flex-1 py-2.5 text-sm">
          {pending ? "저장 중…" : link ? "저장" : "링크 추가"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full px-4 text-sm text-muted transition hover:bg-[var(--glass-bg-hover)]"
          >
            취소
          </button>
        )}
      </div>
    </form>
  );
}
