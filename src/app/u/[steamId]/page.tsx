import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Gamepad2, Heart, Library, Users } from "lucide-react";
import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/lib/session";
import { getPublicProfileBySlug } from "@/lib/services/social";
import { getSteamAppHeaderUrl } from "@/lib/api/steam-profile";
import { PublicProfileActions } from "@/components/social/PublicProfileActions";
import { SteamProfileHeader } from "@/components/profile/SteamProfileHeader";

interface PublicProfilePageProps {
  params: Promise<{ steamId: string }>;
}

export async function generateMetadata({ params }: PublicProfilePageProps): Promise<Metadata> {
  const { steamId } = await params;
  const data = await getPublicProfileBySlug(steamId, null);
  if (!data) return { title: "Profile" };
  const name = data.profile.steamPersona || data.profile.name || "Player";
  return {
    title: `${name} — GamePrice Profili`,
    description: `${name} GamePrice profili — wishlist, kütüphane ve rozetler.`,
    openGraph: {
      title: `${name} — GamePrice`,
      description: "Oyun wishlist ve Steam profili",
      type: "profile",
    },
  };
}

const badgeClass: Record<string, string> = {
  red: "bg-red-600/90 text-white border-red-400/50",
  amber: "bg-amber-500/90 text-white border-amber-300/50",
  blue: "bg-sky-600/90 text-white border-sky-300/50",
  indigo: "bg-indigo-600/90 text-white border-indigo-400/50",
  emerald: "bg-emerald-600/90 text-white border-emerald-400/50",
};

export default async function PublicProfilePage({ params }: PublicProfilePageProps) {
  const { steamId } = await params;
  const viewerSessionId = (await cookies()).get(SESSION_COOKIE)?.value ?? null;
  const data = await getPublicProfileBySlug(steamId, viewerSessionId);
  if (!data) notFound();

  const displayName = data.profile.steamPersona || data.profile.name || "Player";
  const headerBadges = [
    ...data.badges.map((badge) => ({
      id: badge.id,
      label: badge.label,
      cls: badgeClass[badge.tone],
    })),
    ...data.appearance.badges.map((badge) => ({
      id: badge.id,
      label: badge.label,
      cls: badge.toneClass,
    })),
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <SteamProfileHeader
        displayName={displayName}
        avatarUrl={data.profile.steamAvatar}
        frameId={data.appearance.frameId}
        effectId={data.appearance.effectId}
        badges={headerBadges}
        showSteamBadge
        meta={<p>Steam ID: {data.profile.steamId}</p>}
        actions={
          <PublicProfileActions relationship={data.relationship} sessionId={data.sessionId} />
        }
      >
        <div className="grid grid-cols-1 min-[400px]:grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard icon={Heart} label="Wishlist" value={String(data.stats.wishlistCount)} />
          <StatCard icon={Library} label="Library" value={String(data.stats.libraryCount)} />
          <StatCard icon={Users} label="Friend" value={data.isFriend ? "Yes" : "No"} />
          <StatCard
            icon={Gamepad2}
            label="Owned from wishlist"
            value={String(data.stats.viewerOwnsFromWishlist)}
          />
        </div>
      </SteamProfileHeader>

      <div className="mb-8" />

      {data.commonWishlist.length > 0 && (
        <section className="mb-8">
          <h2 className="font-semibold text-lg mb-4">Common wishlist games</h2>
          <div className="flex flex-wrap gap-2">
            {data.commonWishlist.map((title) => (
              <span key={title} className="px-3 py-1.5 rounded-full bg-card border border-border text-sm">
                {title}
              </span>
            ))}
          </div>
        </section>
      )}

      {data.commonLibrary.length > 0 && (
        <section className="mb-8">
          <h2 className="font-semibold text-lg mb-4">Common library games</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {data.commonLibrary.map((game) => (
              <Link
                key={game.steamAppId}
                href={`/game/steam-${game.steamAppId}`}
                className="group rounded-xl overflow-hidden border border-border bg-card hover:border-accent/30 transition-colors"
              >
                <div className="relative aspect-460/215 bg-background">
                  <Image
                    src={getSteamAppHeaderUrl(game.steamAppId)}
                    alt={game.name || ""}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                    sizes="220px"
                  />
                </div>
                <p className="p-2.5 text-xs font-medium line-clamp-2">{game.name || `App ${game.steamAppId}`}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {data.wishlistPreview.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg">Wishlist preview</h2>
            <Link href="/social" className="text-sm text-accent hover:underline">
              Back to social
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {data.wishlistPreview.map((item) => (
              <Link
                key={item.id}
                href={`/game/${item.cheapSharkGameId}`}
                className="group rounded-xl overflow-hidden border border-border bg-card hover:border-accent/30 transition-colors"
              >
                {item.cheapSharkGameId.startsWith("steam-") && (
                  <div className="relative aspect-460/215 bg-background">
                    <Image
                      src={getSteamAppHeaderUrl(item.cheapSharkGameId.replace("steam-", ""))}
                      alt={item.gameTitle}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                      sizes="220px"
                    />
                  </div>
                )}
                <p className="p-2.5 text-xs font-medium line-clamp-2">{item.gameTitle}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Heart;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-[#2a475e]/60 bg-[#1b2838] p-4">
      <Icon className="mb-2 h-4 w-4 text-[#66c0f4]" />
      <p className="text-xs text-[#acb2b8] leading-snug line-clamp-2">{label}</p>
      <p className="mt-1 text-xl font-bold text-white">{value}</p>
    </div>
  );
}
