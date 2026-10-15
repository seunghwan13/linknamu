import { randomBytes } from "node:crypto";
import type { Db } from "mongodb";
import { cacheLife, cacheTag } from "next/cache";
import { defaultLinks, type LinkItem } from "@/data/profile";
import { getDb } from "./mongodb";

export const LINKS_TAG = "links";

/** 링크 목록 전체를 문서 하나에 배열로 저장 (순서 변경을 한 번에 저장하기 위해) */
type LinksDoc = {
  _id: "links";
  items: LinkItem[];
  updatedAt: Date;
};

function settings(db: Db) {
  return db.collection<LinksDoc>("settings");
}

/** 저장된 적이 없으면 기본 링크를 사용. 빈 배열로 저장했다면 빈 목록 그대로 */
export async function loadLinks(db: Db): Promise<LinkItem[]> {
  const doc = await settings(db).findOne({ _id: "links" });
  // 호출한 쪽에서 배열을 고쳐도 기본값 상수가 바뀌지 않도록 복사본을 반환
  return [...(doc?.items ?? defaultLinks)];
}

export async function saveLinks(db: Db, items: LinkItem[]) {
  await settings(db).updateOne(
    { _id: "links" },
    { $set: { items, updatedAt: new Date() } },
    { upsert: true },
  );
}

/** 공개 페이지용. 관리자 페이지에서 수정하면 updateTag(LINKS_TAG)로 즉시 갱신됨 */
export async function getLinks(): Promise<LinkItem[]> {
  "use cache";
  cacheTag(LINKS_TAG);
  cacheLife("days");

  const db = await getDb();
  if (!db) return defaultLinks;
  return loadLinks(db);
}

/** 클릭 수 집계용 고유 ID. 한 번 정하면 바뀌지 않음 */
export function newLinkId(existing: LinkItem[]) {
  let id: string;
  do {
    id = `link-${randomBytes(4).toString("hex")}`;
  } while (existing.some((link) => link.id === id));
  return id;
}
