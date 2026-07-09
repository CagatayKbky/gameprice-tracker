import { cookies } from "next/headers";
import { type Locale, t as translate } from "./translations";

const LOCALE_COOKIE = "gameprice-locale";

export async function getServerLocale(): Promise<Locale> {
  const jar = await cookies();
  const value = jar.get(LOCALE_COOKIE)?.value;
  return value === "en" ? "en" : "tr";
}

export async function serverT(key: string): Promise<string> {
  const locale = await getServerLocale();
  return translate(locale, key);
}
