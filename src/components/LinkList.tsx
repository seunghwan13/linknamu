"use client";

import { useEffect, useState } from "react";
import type { LinkItem } from "@/data/profile";
import LinkCard from "./LinkCard";

type ClickCount = { id: string; count: number };

export default function LinkList({ links }: { links: LinkItem[] }) {
  // 데이터를 받기 전에는 모두 0회로 표시
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const controller = new AbortController();

    fetch("/api/clicks", { cache: "no-store", signal: controller.signal })
      .then((res) => (res.ok ? (res.json() as Promise<ClickCount[]>) : null))
      .then((data) => {
        if (!data) return;
        // 받아오는 사이 발생한 클릭(+1)은 유지되도록 큰 값을 사용
        setCounts((prev) =>
          Object.fromEntries(data.map(({ id, count }) => [id, Math.max(count, prev[id] ?? 0)])),
        );
      })
      .catch(() => {}); // 실패하면 0회 그대로 표시

    return () => controller.abort();
  }, []);

  const handleClick = (id: string) => {
    setCounts((prev) => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));
  };

  return (
    <ul className="flex w-full flex-col gap-4">
      {links.map((link) => (
        <li key={link.id}>
          <LinkCard link={link} count={counts[link.id] ?? 0} onClick={handleClick} />
        </li>
      ))}
    </ul>
  );
}
