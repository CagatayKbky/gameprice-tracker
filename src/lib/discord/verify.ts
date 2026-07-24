import nacl from "tweetnacl";

/**
 * Verify Discord interaction signature (Ed25519).
 * @see https://discord.com/developers/docs/interactions/receiving-and-responding
 */
export function verifyDiscordRequest(
  publicKeyHex: string,
  signatureHex: string,
  timestamp: string,
  body: string
): boolean {
  try {
    return nacl.sign.detached.verify(
      Buffer.from(timestamp + body),
      Buffer.from(signatureHex, "hex"),
      Buffer.from(publicKeyHex, "hex")
    );
  } catch {
    return false;
  }
}
