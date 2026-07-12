const DEFAULT_GOG_CLIENT_ID = "46899977096215655";
const DEFAULT_GOG_CLIENT_SECRET =
  "9d85c43b1482497dbbce61f6e4aa173a433796eeae2ca8c5f6129f2dc4de46d9";

export function getGogOAuthConfig() {
  const clientId = process.env.GOG_CLIENT_ID || DEFAULT_GOG_CLIENT_ID;
  const clientSecret = process.env.GOG_CLIENT_SECRET || DEFAULT_GOG_CLIENT_SECRET;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const redirectUri = process.env.GOG_REDIRECT_URI || `${appUrl}/api/auth/gog/callback`;

  if (!clientId || !clientSecret) return null;

  return { clientId, clientSecret, redirectUri };
}

export function getGogAuthUrl(state: string) {
  const config = getGogOAuthConfig();
  if (!config) return null;

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: "code",
    layout: "client2",
    state,
  });

  return `https://auth.gog.com/auth?${params.toString()}`;
}

export async function exchangeGogCode(code: string) {
  const config = getGogOAuthConfig();
  if (!config) throw new Error("gog_not_configured");

  const params = new URLSearchParams({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    grant_type: "authorization_code",
    code,
    redirect_uri: config.redirectUri,
  });

  const res = await fetch(`https://auth.gog.com/token?${params.toString()}`, {
    signal: AbortSignal.timeout(10000),
  });

  if (!res.ok) throw new Error("gog_token_failed");
  return res.json() as Promise<{
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
    user_id?: string;
  }>;
}

export async function refreshGogToken(refreshToken: string) {
  const config = getGogOAuthConfig();
  if (!config) throw new Error("gog_not_configured");

  const params = new URLSearchParams({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });

  const res = await fetch(`https://auth.gog.com/token?${params.toString()}`, {
    signal: AbortSignal.timeout(10000),
  });

  if (!res.ok) throw new Error("gog_refresh_failed");
  return res.json() as Promise<{
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
  }>;
}
