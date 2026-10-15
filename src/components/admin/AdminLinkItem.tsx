"use client";

import { useState } from "react";
import { deleteLink, moveLink } from "@/app/admin/actions";
import type { LinkItem } from "@/data/profile";
import ConfirmDeleteButton from "./ConfirmDeleteButton";
import LinkForm from "./LinkForm";

type Props = {
  link: LinkItem;
  clicks: number;
  isFirst: boolean;
  isLast: boolean;
};

const iconButton =
  "flex h-8 w-8 items-center justify-center rounded-full text-muted transition hover:bg-[var(--glass-bg-hover)] disabled:pointer-events-none disabled:opacity-30";

export default function AdminLinkItem({ link, clicks, isFirst, isLast }: Props) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <li className="glass-panel p-5">
        <LinkForm link={link} onSaved={() => setEditing(false)} onCancel={() => setEditing(false)} />
      </li>
    );
  }

  return (
    <li className="glass-panel flex items-center gap-3 p-4">
      <form action={moveLink} className="flex flex-col">
        <input type="hidden" name="id" value={link.id} />
        <button type="submit" name="direction" value="up" disabled={isFirst} aria-label="위로" className={iconButton}>
          ▲
        </button>
        <button type="submit" name="direction" value="down" disabled={isLast} aria-label="아래로" className={iconButton}>
          ▼
        </button>
      </form>

      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold">
          <span aria-hidden="true">{link.emoji}</span> {link.title}
        </p>
        <p className="truncate text-xs text-muted">{link.url}</p>
        <p className="mt-0.5 text-xs text-muted tabular-nums">클릭 {clicks.toLocaleString("ko-KR")}회</p>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-1 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="rounded-full px-4 py-1.5 text-sm transition hover:bg-[var(--glass-bg-hover)]"
        >
          수정
        </button>
        <form action={deleteLink}>
          <input type="hidden" name="id" value={link.id} />
          <ConfirmDeleteButton message={`'${link.title}' 링크를 삭제할까요? 되돌릴 수 없습니다.`} />
        </form>
      </div>
    </li>
  );
}
