import { createHmac } from "node:crypto";
import type { Db } from "mongodb";

type RateLimitDoc = {
  key: string;
  createdAt: Date;
};

const COLLECTION = "rate_limits";

const globalForRateLimit = globalThis as unknown as {
  _rateLimitIndex?: Promise<string>;
};

/** 오래된 기록은 1시간 뒤 MongoDB가 자동으로 지우도록 TTL 인덱스를 한 번만 생성 */
function ensureIndex(db: Db) {
  globalForRateLimit._rateLimitIndex ??= db
    .collection<RateLimitDoc>(COLLECTION)
    .createIndex({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 });
  return globalForRateLimit._rateLimitIndex;
}

/** IP 원문은 저장하지 않고, 서버 비밀값으로 해시한 값만 사용 */
export function clientKey(headers: Headers) {
  const ip =
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    "unknown";
  const secret = process.env.ADMIN_PASSWORD ?? "linknamu";
  return createHmac("sha256", secret).update(ip).digest("base64url").slice(0, 32);
}

/** windowMs 동안 같은 key로 기록된 횟수가 limit 이상이면 true */
export async function isRateLimited(db: Db, key: string, limit: number, windowMs: number) {
  await ensureIndex(db);
  const since = new Date(Date.now() - windowMs);
  const count = await db
    .collection<RateLimitDoc>(COLLECTION)
    .countDocuments({ key, createdAt: { $gte: since } });
  return count >= limit;
}

export async function recordHit(db: Db, key: string) {
  await ensureIndex(db);
  await db.collection<RateLimitDoc>(COLLECTION).insertOne({ key, createdAt: new Date() });
}
