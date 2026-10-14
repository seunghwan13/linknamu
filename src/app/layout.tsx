import type { Metadata, Viewport } from "next";
import { Gowun_Dodum, Nunito } from "next/font/google";
import { profile } from "@/data/profile";
import "./globals.css";

// 영문: Nunito, 한글: Gowun Dodum (둘 다 둥근 산세리프)
const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "600", "800"],
});

const gowunDodum = Gowun_Dodum({
  variable: "--font-gowun-dodum",
  weight: "400",
  preload: false, // 한글 글리프는 필요한 범위만 내려받음
});

export const metadata: Metadata = {
  title: `${profile.name} | 링크나무`,
  description: profile.bio,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#eef3fb" },
    { media: "(prefers-color-scheme: dark)", color: "#0d1320" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={`${nunito.variable} ${gowunDodum.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
