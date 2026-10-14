import { connection } from "next/server";
import { links } from "@/data/profile";
import { getDb, type ClickDoc } from "@/lib/mongodb";

// 링크별 클릭 수를 조회합니다.
export async function GET() {
  await connection(); // 빌드 시 프리렌더링하지 않고 요청마다 최신 값을 읽음

  const db = await getDb();
  if (!db) {
    return Response.json({ error: "MONGODB_URI가 설정되지 않았습니다." }, { status: 503 });
  }

  const docs = await db.collection<ClickDoc>("clicks").find().toArray();
  const counts = new Map(docs.map((doc) => [doc._id, doc.count]));

  return Response.json(
    links.map((link) => ({ id: link.id, title: link.title, count: counts.get(link.id) ?? 0 })),
  );
}
