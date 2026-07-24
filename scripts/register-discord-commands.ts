/**
 * Register Discord slash commands.
 *
 * Env:
 *   DISCORD_BOT_TOKEN
 *   DISCORD_APPLICATION_ID
 *   DISCORD_GUILD_ID (optional — guild commands propagate instantly)
 *
 * Usage: npm run discord:register
 */
import { DISCORD_COMMANDS } from "../src/lib/discord/commands";

async function main() {
  const token = process.env.DISCORD_BOT_TOKEN;
  const appId = process.env.DISCORD_APPLICATION_ID;
  const guildId = process.env.DISCORD_GUILD_ID;

  if (!token || !appId) {
    console.error("Missing DISCORD_BOT_TOKEN or DISCORD_APPLICATION_ID");
    process.exit(1);
  }

  const url = guildId
    ? `https://discord.com/api/v10/applications/${appId}/guilds/${guildId}/commands`
    : `https://discord.com/api/v10/applications/${appId}/commands`;

  const res = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bot ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(DISCORD_COMMANDS),
  });

  const text = await res.text();
  if (!res.ok) {
    console.error("Register failed:", res.status, text);
    process.exit(1);
  }

  console.log(
    guildId
      ? `Guild commands registered for ${guildId}`
      : "Global commands registered (may take up to 1 hour)"
  );
  console.log(text);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
