"use client";

import { useRef, useState } from "react";
import { siteUrl } from "@/data/profile";

const pillClass =
  "rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 py-2 text-sm font-semibold shadow-[var(--glass-shadow)] backdrop-blur-xl transition hover:bg-[var(--glass-bg-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400";

export default function ShareActions({ title }: { title: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [copied, setCopied] = useState(false);

  const share = async () => {
    // 휴대폰은 기본 공유 시트, 지원하지 않는 브라우저는 주소 복사
    if (navigator.share) {
      try {
        await navigator.share({ title, url: siteUrl });
      } catch {} // 사용자가 공유를 취소한 경우
      return;
    }
    try {
      await navigator.clipboard.writeText(siteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <>
      <div className="flex gap-2.5">
        <button type="button" onClick={share} className={pillClass}>
          {copied ? "✅ 주소 복사됨" : "🔗 공유하기"}
        </button>
        <button type="button" onClick={() => dialogRef.current?.showModal()} className={pillClass}>
          📱 QR 코드
        </button>
      </div>

      <dialog
        ref={dialogRef}
        aria-labelledby="qr-title"
        // 바깥(배경)을 누르면 닫기
        onClick={(e) => e.target === e.currentTarget && e.currentTarget.close()}
        className="m-auto w-[calc(100%-2rem)] max-w-xs rounded-3xl bg-background p-0 text-foreground shadow-2xl backdrop:bg-black/40 backdrop:backdrop-blur-sm"
      >
        <div className="flex flex-col items-center gap-4 p-6">
          <h2 id="qr-title" className="text-lg font-extrabold">
            QR 코드
          </h2>
          {/* eslint-disable-next-line @next/next/no-img-element -- 생성된 PNG를 원본 그대로 표시 */}
          <img
            src="/qr.png"
            alt={`${siteUrl} QR 코드`}
            width={240}
            height={240}
            className="rounded-2xl bg-white"
          />
          <p className="text-sm text-muted">{siteUrl.replace("https://", "")}</p>
          <div className="flex w-full gap-2">
            <a href="/qr.png" download="timkim-qr.png" className="glass-button flex-1 text-center text-sm">
              이미지 저장
            </a>
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              className="flex-1 rounded-full text-sm text-muted transition hover:bg-[var(--glass-bg-hover)]"
            >
              닫기
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
