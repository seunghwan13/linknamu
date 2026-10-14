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

// 여기 값을 바꿔서 내 프로필과 링크를 설정하세요.
export const profile: Profile = {
  name: "TIM",
  bio: '"구청장을 꿈꾸는 9급공무원"',
  image: "/profile.jpg",
};

export const links: LinkItem[] = [
  { id: "github", emoji: "🐙", title: "GitHub", url: "https://github.com/seunghwan13" },
  { id: "linktree", emoji: "🌳", title: "Linktree", url: "https://linktr.ee/Hwan.Tim" },
  { id: "blog", emoji: "📝", title: "Blog", url: "https://blog.naver.com/seung_hwun7" },
];
