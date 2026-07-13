import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Gamepad2, Heart, Library, Users } from "lucide-react";
import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/lib/session";
import { getPublicProfileBySlug } from "@/lib/services/social";
import { GameImage } from "@/components/ui/GameImage";
import { getSteamLibraryImage, resolveGameImage } from "@/lib/game-images";
import { extractSteamAppId } from "@/lib/game-id";
import { PublicProfileActions } from "@/components/social/PublicProfileActions";
import { SteamProfileHeader } from "@/components/profile/SteamProfileHeader";
import { getServerLocale } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/translations";

interface PublicProfilePageProps {
  params: Promise<{ steamId: string }>;
}

export async function generateMetadata({ params }: PublicProfilePageProps): Promise<Metadata> {
  const locale = await getServerLocale();
  const { steamId } = await params;
  const data = await getPublicProfileBySlug(steamId, null);
  if (!data) return { title: t(locale, "publicProfile.notFound") };
  const name = data.profile.steamPersona || data.profile.name || t(locale, "profile.guestName");
  return {
    title: `${name} — ${t(locale, "publicProfile.metaTitle")}`,
    description: t(locale, "publicProfile.metaDesc", { name }),
    openGraph: {
      title: `${name} — GamePrice`,
      description: t(locale, "publicProfile.metaDesc", { name }),
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
  const locale = await getServerLocale();
  const { steamId } = await params;
  const viewerSessionId = (await cookies()).get(SESSION_COOKIE)?.value ?? null;
  const data = await getPublicProfileBySlug(steamId, viewerSessionId);
  if (!data) notFound();

  const displayName =
    data.profile.steamPersona || data.profile.name || t(locale, "profile.guestName");
  const avatarUrl = data.profile.steamAvatar || data.profile.googleAvatar;
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
        avatarUrl={avatarUrl}
        frameId={data.appearance.frameId}
        effectId={data.appearance.effectId}
        badges={headerBadges}
        showSteamBadge={Boolean(data.profile.steamId)}
        meta={
          data.profile.steamId ? (
            <p>{t(locale, "publicProfile.steamId", { id: data.profile.steamId })}</p>
          ) : (
            <p>{t(locale, "publicProfile.gamepriceMember")}</p>
          )
        }
        actions={
          <PublicProfileActions relationship={data.relationship} sessionId={data.sessionId} />
        }
      >
        <div className="grid grid-cols-1 min-[400px]:grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard
            icon={Heart}
            label={t(locale, "publicProfile.statWishlist")}
            value={String(data.stats.wishlistCount)}
          />
          <StatCard
            icon={Library}
            label={t(locale, "publicProfile.statLibrary")}
            value={String(data.stats.libraryCount)}
          />
          <StatCard
            icon={Users}
            label={t(locale, "publicProfile.statFriend")}
            value={data.isFriend ? t(locale, "publicProfile.yes") : t(locale, "publicProfile.no")}
          />
          <StatCard
            icon={Gamepad2}
            label={t(locale, "publicProfile.statOwnedFromWishlist")}
            value={String(data.stats.viewerOwnsFromWishlist)}
          />
        </div>
      </SteamProfileHeader>

      <div className="mb-8" />

      {data.commonWishlist.length > 0 && (
        <section className="mb-8">
          <h2 className="font-semibold text-lg mb-4">{t(locale, "publicProfile.commonWishlist")}</h2>
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
          <h2 className="font-semibold text-lg mb-4">{t(locale, "publicProfile.commonLibrary")}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {data.commonLibrary.map((game) => (
              <Link
                key={game.steamAppId}
                href={`/game/steam-${game.steamAppId}`}
                className="group rounded-2xl overflow-hidden border border-border bg-card hover:border-accent/40 transition-all"
              >
                <div className="relative aspect-[3/4] bg-background">
                  <GameImage
                    src={getSteamLibraryImage(game.steamAppId)}
                    steamAppId={game.steamAppId}
                    alt={game.name || ""}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
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
            <h2 className="font-semibold text-lg">{t(locale, "publicProfile.wishlistPreview")}</h2>
            <Link href="/social" className="text-sm text-accent hover:underline">
              {t(locale, "publicProfile.backSocial")}
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {data.wishlistPreview.map((item) => {
              const steamAppId = extractSteamAppId(item.cheapSharkGameId);
              const imageUrl = resolveGameImage({ steamAppId });
              return (
              <Link
                key={item.id}
                href={`/game/${item.cheapSharkGameId}`}
                className="group rounded-2xl overflow-hidden border border-border bg-card hover:border-accent/40 transition-all"
              >
                <div className="relative aspect-[3/4] bg-background">
                  <GameImage
                    src={imageUrl}
                    steamAppId={steamAppId}
                    alt={item.gameTitle}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <p className="p-2.5 text-xs font-medium line-clamp-2">{item.gameTitle}</p>
              </Link>
            );
            })}
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
