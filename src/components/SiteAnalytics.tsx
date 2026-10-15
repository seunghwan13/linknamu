"use client";

import { Analytics } from "@vercel/analytics/next";

/** Vercel Web Analytics 방문 집계. 관리자 페이지 방문은 세지 않음 */
export default function SiteAnalytics() {
  return (
    <Analytics
      beforeSend={(event) => (new URL(event.url).pathname.startsWith("/admin") ? null : event)}
    />
  );
}
