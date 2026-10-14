"use client";

import { useEffect, useState, type FormEvent } from "react";
import { MESSAGE_MAX, NICKNAME_MAX, charCount, type PublicMessage } from "@/lib/messages";

type Status = { type: "idle" } | { type: "success" } | { type: "error"; message: string };

const dateFormat = new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium", timeZone: "Asia/Seoul" });

export default function Guestbook() {
  const [messages, setMessages] = useState<PublicMessage[]>([]);
  const [nickname, setNickname] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<Status>({ type: "idle" });

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/messages", { cache: "no-store", signal: controller.signal })
      .then((res) => (res.ok ? (res.json() as Promise<PublicMessage[]>) : null))
      .then((data) => data && setMessages(data))
      .catch(() => {});
    return () => controller.abort();
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const website = new FormData(e.currentTarget).get("website");

    setSubmitting(true);
    setStatus({ type: "idle" });
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname, message, website }),
      });
      if (res.ok) {
        setNickname("");
        setMessage("");
        setStatus({ type: "success" });
      } else {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        setStatus({ type: "error", message: data?.error ?? "메시지를 보내지 못했어요. 잠시 후 다시 시도해 주세요." });
      }
    } catch {
      setStatus({ type: "error", message: "메시지를 보내지 못했어요. 잠시 후 다시 시도해 주세요." });
    } finally {
      setSubmitting(false);
    }
  };

  const messageLength = charCount(message);

  return (
    <section className="w-full" aria-labelledby="guestbook-title">
      <div className="mb-5 text-center">
        <h2 id="guestbook-title" className="text-lg font-extrabold tracking-wide">
          💌 방명록
        </h2>
        <p className="mt-1.5 text-sm text-muted">한마디 남겨주세요. 확인 후 공개돼요.</p>
      </div>

      <form onSubmit={handleSubmit} className="glass-panel relative flex flex-col gap-3 p-5">
        {/* 허니팟: 사람에게는 보이지 않는 칸 (봇만 채움) */}
        <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
          <label>
            Website
            <input type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
          </label>
        </div>

        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          maxLength={NICKNAME_MAX}
          required
          placeholder="닉네임"
          aria-label="닉네임"
          className="glass-input"
        />
        <div className="relative">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            rows={3}
            placeholder="메시지를 입력해 주세요"
            aria-label="메시지"
            className="glass-input block w-full resize-none pb-7"
          />
          <span
            className={`pointer-events-none absolute right-4 bottom-2.5 text-xs tabular-nums ${
              messageLength > MESSAGE_MAX ? "text-rose-500" : "text-muted"
            }`}
          >
            {messageLength}/{MESSAGE_MAX}
          </span>
        </div>

        {status.type === "success" && (
          <p role="status" className="text-sm text-emerald-600 dark:text-emerald-400">
            메시지를 보냈어요! 확인 후 공개될 거예요.
          </p>
        )}
        {status.type === "error" && (
          <p role="alert" className="text-sm text-rose-500">
            {status.message}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting || messageLength > MESSAGE_MAX}
          className="glass-button"
        >
          {submitting ? "보내는 중…" : "남기기"}
        </button>
      </form>

      {messages.length > 0 && (
        <ul className="mt-5 flex flex-col gap-3">
          {messages.map((m) => (
            <li key={m.id} className="glass-panel px-5 py-4">
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-sm font-semibold">{m.nickname}</span>
                <time dateTime={m.createdAt} className="shrink-0 text-xs text-muted">
                  {dateFormat.format(new Date(m.createdAt))}
                </time>
              </div>
              <p className="mt-1.5 text-[15px] leading-relaxed break-words whitespace-pre-wrap">
                {m.message}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
