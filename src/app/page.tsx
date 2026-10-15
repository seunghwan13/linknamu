import Guestbook from "@/components/Guestbook";
import LinkList from "@/components/LinkList";
import ProfileHeader from "@/components/ProfileHeader";
import ShareActions from "@/components/ShareActions";
import { profile } from "@/data/profile";
import { getLinks } from "@/lib/links";

export default async function Home() {
  const links = await getLinks();

  return (
    <main className="flex flex-1 justify-center px-7 pt-20 pb-16 sm:px-8 sm:pt-28">
      <div className="flex w-full max-w-sm flex-col items-center gap-12">
        <ProfileHeader profile={profile} />
        <div className="flex w-full flex-col items-center gap-6">
          <LinkList links={links} />
          <ShareActions title={`${profile.name} | 링크나무`} />
        </div>
        <Guestbook />
      </div>
    </main>
  );
}
