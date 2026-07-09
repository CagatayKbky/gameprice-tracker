import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/lib/session";
import { getPremiumStatus } from "@/lib/premium/access";

export async function getServerPremiumStatus() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;
  if (!sessionId) return null;
  return getPremiumStatus(sessionId);
}
