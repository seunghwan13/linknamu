import { approveMessage, deleteMessage } from "@/app/admin/actions";
import type { MessageStatus } from "@/lib/messages";
import ConfirmDeleteButton from "./ConfirmDeleteButton";

type AdminMessage = {
  id: string;
  nickname: string;
  message: string;
  status: MessageStatus;
  createdAt: string;
};

const dateFormat = new Intl.DateTimeFormat("ko-KR", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Seoul",
});

export default function AdminMessageList({ messages }: { messages: AdminMessage[] }) {
  if (messages.length === 0) {
    return <p className="glass-panel p-6 text-center text-sm text-muted">아직 받은 메시지가 없습니다.</p>;
  }

  const pendingCount = messages.filter((m) => m.status === "pending").length;

  return (
    <section>
      <p className="mb-4 text-sm text-muted">
        승인 대기 <strong className="text-foreground">{pendingCount}</strong>개 · 전체 {messages.length}개
      </p>
      <ul className="flex flex-col gap-3">
        {messages.map((m) => (
          <li key={m.id} className="glass-panel p-5">
            <div className="flex items-center justify-between gap-3">
              <span className="font-semibold">{m.nickname}</span>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs ${
                  m.status === "pending"
                    ? "bg-amber-400/20 text-amber-700 dark:text-amber-300"
                    : "bg-emerald-400/20 text-emerald-700 dark:text-emerald-300"
                }`}
              >
                {m.status === "pending" ? "승인 대기" : "공개 중"}
              </span>
            </div>
            <p className="mt-2 text-[15px] leading-relaxed break-words whitespace-pre-wrap">{m.message}</p>
            <div className="mt-4 flex items-center justify-between">
              <time dateTime={m.createdAt} className="text-xs text-muted">
                {dateFormat.format(new Date(m.createdAt))}
              </time>
              <div className="flex gap-2">
                {m.status === "pending" && (
                  <form action={approveMessage}>
                    <input type="hidden" name="id" value={m.id} />
                    <button type="submit" className="glass-button px-4 py-1.5 text-sm">
                      승인
                    </button>
                  </form>
                )}
                <form action={deleteMessage}>
                  <input type="hidden" name="id" value={m.id} />
                  <ConfirmDeleteButton />
                </form>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
