import { getLinks } from "@/lib/links";
import { getDb, type ClickDoc } from "@/lib/mongodb";

// 링크 클릭 시 해당 링크의 클릭 수를 1 증가시킵니다.
export async function POST(_req: Request, ctx: RouteContext<"/api/clicks/[id]">) {
  const { id } = await ctx.params;

  const links = await getLinks();
  if (!links.some((link) => link.id === id)) {
    return Response.json({ error: "존재하지 않는 링크입니다." }, { status: 404 });
  }

  const db = await getDb();
  if (!db) {
    return Response.json({ error: "MONGODB_URI가 설정되지 않았습니다." }, { status: 503 });
  }

  const result = await db
    .collection<ClickDoc>("clicks")
    .findOneAndUpdate(
      { _id: id },
      { $inc: { count: 1 }, $set: { updatedAt: new Date() } },
      { upsert: true, returnDocument: "after" },
    );

  return Response.json({ id, count: result?.count ?? 1 });
}
