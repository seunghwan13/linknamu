export type Profile = {
  name: string;
  bio: string;
  image: string;
};

export type LinkItem = {
  /** 클릭 수 집계에 쓰이는 고유 ID (영문 소문자, 숫자, 하이픈) */
  id: string;
  title: string;
  url: string;
  /** 카드 제목 앞에 표시할 이모지 */
  emoji: string;
};

/** 공유 버튼과 QR 코드에 쓰는 사이트 주소 */
export const siteUrl = "https://timkim.org";

// 여기 값을 바꿔서 내 프로필을 설정하세요.
export const profile: Profile = {
  name: "TIM",
  bio: '"구청장을 꿈꾸는 9급공무원"',
  image: "/profile.jpg",
};

/** 링크는 관리자 페이지에서 편집합니다. DB에 저장된 링크가 없을 때만 이 기본값을 보여줍니다. */
export const defaultLinks: LinkItem[] = [
  { id: "github", emoji: "🐙", title: "GitHub", url: "https://github.com/seunghwan13" },
  { id: "linktree", emoji: "🌳", title: "Linktree", url: "https://linktr.ee/Hwan.Tim" },
  { id: "blog", emoji: "📝", title: "Blog", url: "https://blog.naver.com/seung_hwun7" },
];
