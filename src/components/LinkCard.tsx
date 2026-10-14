"use client";

import type { LinkItem } from "@/data/profile";

type Props = {
  link: LinkItem;
  count: number;
  onClick: (id: string) => void;
};

export default function LinkCard({ link, count, onClick }: Props) {
  const trackClick = () => {
    onClick(link.id);
    const endpoint = `/api/clicks/${encodeURIComponent(link.id)}`;
    // 새 탭으로 이동해도 요청이 유실되지 않도록 sendBeacon 우선 사용
    if (!navigator.sendBeacon?.(endpoint)) {
      fetch(endpoint, { method: "POST", keepalive: true }).catch(() => {});
    }
  };

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={trackClick}
      className="group relative flex w-full items-center justify-center rounded-3xl border border-[var(--glass-border)] bg-[var(--glass-bg)] px-16 py-[18px] shadow-[var(--glass-shadow)] backdrop-blur-xl backdrop-saturate-150 transition duration-300 ease-out hover:bg-[var(--glass-bg-hover)] hover:shadow-[var(--glass-shadow-hover)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-400 motion-safe:hover:-translate-y-px"
    >
      <span
        aria-hidden="true"
        className="absolute left-5 text-xl leading-none transition-transform duration-300 motion-safe:group-hover:scale-110"
      >
        {link.emoji}
      </span>
      <span className="font-semibold tracking-wide">{link.title}</span>
      <span
        aria-label={`클릭 ${count}회`}
        className="absolute right-5 text-xs text-muted tabular-nums"
      >
        {count.toLocaleString("ko-KR")}회
      </span>
    </a>
  );
}
