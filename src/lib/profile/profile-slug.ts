export function toProfileSlug(value: string | null | undefined): string | null {
  if (!value) return null;
  const slug = value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || null;
}

export function isSteamId64(value: string): boolean {
  return /^\d{17}$/.test(value);
}

export function getPublicProfilePath(profile: {
  steamId?: string | null;
  profileSlug?: string | null;
  steamPersona?: string | null;
}): string | null {
  const slug = profile.profileSlug || toProfileSlug(profile.steamPersona);
  if (slug) return `/u/${slug}`;
  if (profile.steamId) return `/u/${profile.steamId}`;
  return null;
}
