import { connection } from "next/server";
import { getDb } from "@/lib/mongodb";
import { validateMessageInput, type MessageDoc, type PublicMessage } from "@/lib/messages";
import { clientKey, isRateLimited, recordHit } from "@/lib/rate-limit";

const PUBLIC_LIMIT = 50;
const POST_LIMIT = 3; // 같은 IP에서 1분에 3개까지
const POST_WINDOW_MS = 60 * 1000;

// 승인된 메시지만 최신순으로 반환합니다.
export async function GET() {
  await connection();

  const db = await getDb();
  if (!db) {
    return Response.json({ error: "MONGODB_URI가 설정되지 않았습니다." }, { status: 503 });
  }

  const docs = await db
    .collection<MessageDoc>("messages")
    .find({ status: "approved" })
    .sort({ createdAt: -1 })
    .limit(PUBLIC_LIMIT)
    .toArray();

  const messages: PublicMessage[] = docs.map((doc) => ({
    id: doc._id.toHexString(),
    nickname: doc.nickname,
    message: doc.message,
    createdAt: doc.createdAt.toISOString(),
  }));

  return Response.json(messages);
}

// 새 메시지를 '승인 대기' 상태로 저장합니다.
export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  // 허니팟: 사람에게는 보이지 않는 칸이 채워져 있으면 봇으로 보고 저장하지 않음
  if (typeof body.website === "string" && body.website !== "") {
    return Response.json({ ok: true }, { status: 201 });
  }

  const input = validateMessageInput(body.nickname, body.message);
  if (!input.ok) {
    return Response.json({ error: input.error }, { status: 400 });
  }

  const db = await getDb();
  if (!db) {
    return Response.json({ error: "MONGODB_URI가 설정되지 않았습니다." }, { status: 503 });
  }

  const key = `message:${clientKey(req.headers)}`;
  if (await isRateLimited(db, key, POST_LIMIT, POST_WINDOW_MS)) {
    return Response.json(
      { error: "메시지를 너무 자주 보내고 있어요. 1분 뒤에 다시 시도해 주세요." },
      { status: 429 },
    );
  }

  await db.collection<Omit<MessageDoc, "_id">>("messages").insertOne({
    nickname: input.nickname,
    message: input.message,
    status: "pending",
    createdAt: new Date(),
  });
  await recordHit(db, key);

  return Response.json({ ok: true }, { status: 201 });
}
