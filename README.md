# 링크나무

내 모든 링크를 한 페이지에 모아두고, 하나의 URL로 공유하는 서비스입니다. (Next.js 16 · Tailwind CSS · MongoDB Atlas)

## 시작하기

```bash
npm install
cp .env.example .env.local   # MONGODB_URI 값을 채워 넣기
npm run dev
```

http://localhost:3000 에서 확인합니다.

## 프로필·링크 수정

`src/data/profile.ts` 에서 이름, 한 줄 소개, 프로필 사진을 바꿉니다.
프로필 사진은 `public/` 에 넣고 `image` 경로를 바꾸면 됩니다.

링크는 `/admin` 관리자 페이지에서 추가·수정·삭제·순서 변경합니다. MongoDB `settings` 컬렉션에 저장되며,
한 번도 저장하지 않았다면 `profile.ts` 의 `defaultLinks` 를 보여줍니다.

## 클릭 수 집계

- 링크 카드를 클릭하면 `POST /api/clicks/[id]` 로 MongoDB `clicks` 컬렉션의 카운트가 1 증가합니다.
- `GET /api/clicks` 로 링크별 클릭 수를 확인할 수 있습니다.
- `MONGODB_URI` 가 없으면 API는 503을 반환하고, 페이지와 링크 이동은 그대로 동작합니다.

## 배포 (Vercel)

Vercel 프로젝트 설정의 Environment Variables 에 `MONGODB_URI`, `MONGODB_DB` 를 등록합니다.
