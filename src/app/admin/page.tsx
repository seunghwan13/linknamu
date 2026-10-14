import type { Metadata } from "next";
import { Suspense } from "react";
import AdminLoginForm from "@/components/admin/AdminLoginForm";
import AdminMessageList from "@/components/admin/AdminMessageList";
import { isAdmin, isAdminConfigured } from "@/lib/admin-auth";
import type { MessageDoc } from "@/lib/messages";
import { getDb } from "@/lib/mongodb";
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
  const docs = await db
    .collection<MessageDoc>("messages")
    .find()
    .sort({ status: -1, createdAt: -1 })
    .limit(200)
    .toArray();

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
        <h1 className="text-xl font-extrabold">방명록 관리</h1>
        <form action={logout}>
          <button type="submit" className="text-sm text-muted underline-offset-4 hover:underline">
            로그아웃
          </button>
        </form>
      </div>
      <AdminMessageList messages={messages} />
    </>
  );
}
