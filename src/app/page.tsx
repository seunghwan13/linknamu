import LinkList from "@/components/LinkList";
import ProfileHeader from "@/components/ProfileHeader";
import { links, profile } from "@/data/profile";

export default function Home() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-10 sm:py-16">
      {/* 와이어프레임의 바깥 둥근 카드 */}
      <section className="flex w-full max-w-md flex-col items-center gap-10 rounded-[2rem] border-2 border-foreground/80 bg-background px-6 pt-12 pb-10 shadow-sm sm:px-10">
        <ProfileHeader profile={profile} />
        <LinkList links={links} />
      </section>
    </main>
  );
}
