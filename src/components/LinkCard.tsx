"use client";

import type { LinkItem } from "@/data/profile";

export default function LinkCard({ link }: { link: LinkItem }) {
  const trackClick = () => {
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
      className="block w-full rounded-2xl border-2 border-foreground/80 bg-background px-5 py-5 text-center font-medium shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-500 hover:shadow-md active:translate-y-0"
    >
      {link.title}
    </a>
  );
}
