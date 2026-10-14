import Guestbook from "@/components/Guestbook";
import LinkList from "@/components/LinkList";
import ProfileHeader from "@/components/ProfileHeader";
import { links, profile } from "@/data/profile";

export default function Home() {
  return (
    <main className="flex flex-1 justify-center px-7 pt-20 pb-16 sm:px-8 sm:pt-28">
      <div className="flex w-full max-w-sm flex-col items-center gap-12">
        <ProfileHeader profile={profile} />
        <LinkList links={links} />
        <Guestbook />
      </div>
    </main>
  );
}
