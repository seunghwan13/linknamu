import Image from "next/image";
import type { Profile } from "@/data/profile";

export default function ProfileHeader({ profile }: { profile: Profile }) {
  return (
    <header className="flex flex-col items-center text-center">
      <Image
        src={profile.image}
        alt={`${profile.name} 프로필 사진`}
        width={192}
        height={192}
        priority
        className="h-28 w-28 rounded-full object-cover ring-4 ring-[var(--avatar-ring)] shadow-[var(--avatar-shadow)] sm:h-32 sm:w-32"
      />
      <h1 className="mt-7 text-2xl font-extrabold tracking-[0.08em]">{profile.name}</h1>
      <p className="mt-2.5 text-[15px] leading-relaxed text-muted">{profile.bio}</p>
    </header>
  );
}
