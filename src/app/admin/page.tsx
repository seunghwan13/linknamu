import type { Metadata } from "next";
import { Suspense } from "react";
import AdminLinkItem from "@/components/admin/AdminLinkItem";
import AdminLoginForm from "@/components/admin/AdminLoginForm";
import AdminMessageList from "@/components/admin/AdminMessageList";
import LinkForm from "@/components/admin/LinkForm";
import { isAdmin, isAdminConfigured } from "@/lib/admin-auth";
import { loadLinks } from "@/lib/links";
import type { MessageDoc } from "@/lib/messages";
import { getDb, type ClickDoc } from "@/lib/mongodb";
import { logout } from "./actions";

export const metadata: Metadata = {
  title: "관리자 | 링크나무",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <main className="flex flex-1 justify-center px-6 pt-16 pb-16 sm:px-8">
      <div className="w-full max-w-xl">
        <Suspense fallback={<p className="text-center text-sm text-muted">불러오는 중…</p>}>
          <AdminContent />
        </Suspense>
      </div>
    </main>
  );
}

async function AdminContent() {
  if (!isAdminConfigured()) {
    return (
      <p className="glass-panel p-6 text-center text-sm text-muted">
        ADMIN_PASSWORD 환경변수가 설정되지 않아 관리자 페이지를 사용할 수 없습니다.
      </p>
    );
  }

  if (!(await isAdmin())) {
    return <AdminLoginForm />;
  }

  const db = await getDb();
  if (!db) {
    return <p className="glass-panel p-6 text-center text-sm text-muted">데이터베이스에 연결할 수 없습니다.</p>;
  }

  // 승인 대기 메시지를 먼저, 각각 최신순으로
  const [docs, links, clickDocs] = await Promise.all([
    db.collection<MessageDoc>("messages").find().sort({ status: -1, createdAt: -1 }).limit(200).toArray(),
    loadLinks(db),
    db.collection<ClickDoc>("clicks").find().toArray(),
  ]);
  const clicks = new Map(clickDocs.map((doc) => [doc._id, doc.count]));

  const messages = docs.map((doc) => ({
    id: doc._id.toHexString(),
    nickname: doc.nickname,
    message: doc.message,
    status: doc.status,
    createdAt: doc.createdAt.toISOString(),
  }));

  return (
    <>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-xl font-extrabold">링크 관리</h1>
        <form action={logout}>
          <button type="submit" className="text-sm text-muted underline-offset-4 hover:underline">
            로그아웃
          </button>
        </form>
      </div>
      <section className="mb-14">
        {links.length > 0 ? (
          <ul className="mb-4 flex flex-col gap-3">
            {links.map((link, i) => (
              <AdminLinkItem
                key={link.id}
                link={link}
                clicks={clicks.get(link.id) ?? 0}
                isFirst={i === 0}
                isLast={i === links.length - 1}
              />
            ))}
          </ul>
        ) : (
          <p className="glass-panel mb-4 p-6 text-center text-sm text-muted">링크가 없습니다. 아래에서 추가해 주세요.</p>
        )}
        <div className="glass-panel p-5">
          <h2 className="mb-3 text-sm font-semibold">새 링크</h2>
          <LinkForm />
        </div>
      </section>

      <h2 className="mb-8 text-xl font-extrabold">방명록 관리</h2>
      <AdminMessageList messages={messages} />
    </>
  );
}
