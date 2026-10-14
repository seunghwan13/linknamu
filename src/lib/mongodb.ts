import { MongoClient, type Db } from "mongodb";

const globalForMongo = globalThis as unknown as {
  _mongoClientPromise?: Promise<MongoClient>;
};

/** MONGODB_URI가 설정되어 있지 않으면 null을 반환합니다. */
export async function getDb(): Promise<Db | null> {
  const uri = process.env.MONGODB_URI;
  if (!uri) return null;

  // 개발 중 핫 리로드나 서버리스 재사용 시 연결이 중복 생성되지 않도록 전역에 보관
  globalForMongo._mongoClientPromise ??= new MongoClient(uri).connect();
  const client = await globalForMongo._mongoClientPromise;
  return client.db(process.env.MONGODB_DB ?? "linkbio");
}

export type ClickDoc = {
  _id: string; // 링크 ID
  count: number;
  updatedAt: Date;
};
