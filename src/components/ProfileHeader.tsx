import Image from "next/image";
import type { Profile } from "@/data/profile";

export default function ProfileHeader({ profile }: { profile: Profile }) {
  return (
    <header className="flex flex-col items-center text-center">
      <Image
        src={profile.image}
        alt={`${profile.name} 프로필 사진`}
        width={160}
        height={160}
        priority
        className="h-32 w-32 rounded-full border-2 border-foreground/80 object-cover sm:h-40 sm:w-40"
      />
      <h1 className="mt-6 text-2xl font-bold tracking-tight">{profile.name}</h1>
      <p className="mt-2 text-base text-foreground/70">{profile.bio}</p>
    </header>
  );
}
