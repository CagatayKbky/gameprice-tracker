import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { verifyDiscordRequest } from "@/lib/discord/verify";
import {
  embedDeals,
  embedPrice,
  embedSearchResults,
} from "@/lib/discord/commands";
import { unifiedSearch, resolveGame } from "@/lib/api/unified-search";
import { getMegaDeals } from "@/lib/api/deals";
import { resolveGameImage } from "@/lib/game-images";

export const runtime = "nodejs";

const PING = 1;
const APPLICATION_COMMAND = 2;
const PONG = 1;
const CHANNEL_MESSAGE = 4;
const DEFERRED = 5;

type InteractionOption = {
  name: string;
  type: number;
  value?: string | number | boolean;
};

type InteractionBody = {
  type: number;
  id: string;
  token: string;
  data?: {
    name?: string;
    options?: InteractionOption[];
  };
};

function optionString(options: InteractionOption[] | undefined, name: string) {
  const opt = options?.find((o) => o.name === name);
  return typeof opt?.value === "string" ? opt.value.trim() : "";
}

async function followUp(interactionToken: string, payload: Record<string, unknown>) {
  const appId = process.env.DISCORD_APPLICATION_ID;
  if (!appId) return;
  await fetch(
    `https://discord.com/api/v10/webhooks/${appId}/${interactionToken}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  ).catch((err) => console.error("Discord follow-up failed:", err));
}

async function handleCommand(name: string, options?: InteractionOption[]) {
  if (name === "fiyat") {
    const query = optionString(options, "oyun");
    if (!query) {
      return { content: "Oyun adı gerekli. Örnek: `/fiyat oyun:Elden Ring`" };
    }
    const results = await unifiedSearch(query, { fastSearch: true });
    const top = results[0];
    if (!top) {
      return {
        embeds: [embedSearchResults(query, [])],
      };
    }
    const detail = await resolveGame(top.gameId).catch(() => null);
    const store = detail?.cheapestStore;
    const price = store?.price ?? top.cheapestPrice ?? 0;
    const imageUrl = resolveGameImage({
      imageUrl: detail?.imageUrl ?? top.imageUrl,
      steamAppId: detail?.steamAppId ?? top.steamAppId,
    });
    return {
      embeds: [
        embedPrice({
          title: detail?.title || top.title,
          gameId: top.gameId,
          price,
          normalPrice: store?.normalPrice,
          discount: store?.discount ?? top.maxDiscount,
          storeName: store?.platformName,
          imageUrl,
        }),
      ],
    };
  }

  if (name === "ara") {
    const query = optionString(options, "sorgu");
    if (!query) {
      return { content: "Arama metni gerekli. Örnek: `/ara sorgu:zelda`" };
    }
    const results = await unifiedSearch(query, { fastSearch: true });
    return {
      embeds: [
        embedSearchResults(
          query,
          results.slice(0, 5).map((r) => ({
            title: r.title,
            gameId: r.gameId,
            cheapestPrice: r.cheapestPrice,
          }))
        ),
      ],
    };
  }

  if (name === "indirimler") {
    const deals = await getMegaDeals();
    return {
      embeds: [
        embedDeals(
          deals.slice(0, 8).map((d) => ({
            title: d.title,
            gameId: d.gameId,
            salePrice: d.salePrice,
            discount: d.discount,
            platformName: d.platformName,
          }))
        ),
      ],
    };
  }

  return { content: "Bilinmeyen komut." };
}

export async function POST(request: NextRequest) {
  const publicKey = process.env.DISCORD_PUBLIC_KEY;
  if (!publicKey) {
    return NextResponse.json({ error: "discord_not_configured" }, { status: 503 });
  }

  const signature = request.headers.get("x-signature-ed25519") || "";
  const timestamp = request.headers.get("x-signature-timestamp") || "";
  const rawBody = await request.text();

  if (!verifyDiscordRequest(publicKey, signature, timestamp, rawBody)) {
    return new NextResponse("invalid request signature", { status: 401 });
  }

  let body: InteractionBody;
  try {
    body = JSON.parse(rawBody) as InteractionBody;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  if (body.type === PING) {
    return NextResponse.json({ type: PONG });
  }

  if (body.type === APPLICATION_COMMAND) {
    const commandName = body.data?.name || "";
    const token = body.token;

    after(async () => {
      try {
        const payload = await handleCommand(commandName, body.data?.options);
        await followUp(token, payload);
      } catch (error) {
        console.error("Discord command failed:", error);
        await followUp(token, {
          content: "Komut işlenirken bir hata oluştu. Biraz sonra tekrar dene.",
        });
      }
    });

    return NextResponse.json({ type: DEFERRED });
  }

  return NextResponse.json({ type: CHANNEL_MESSAGE, data: { content: "OK" } });
}
