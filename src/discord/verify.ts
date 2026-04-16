// Utilities for verifying Discord request signatures (Ed25519)
export async function verifyDiscordSignature(publicKeyHex: string, signatureHex: string, timestamp: string, bodyText: string) {
  const publicKey = hexToBytes(publicKeyHex);
  const signature = hexToBytes(signatureHex);
  const message = new TextEncoder().encode(timestamp + bodyText);

  const key = await crypto.subtle.importKey(
    "raw",
    publicKey,
    "Ed25519",
    false,
    ["verify"]
  );

  return await crypto.subtle.verify("Ed25519", key, signature, message);
}

function hexToBytes(hex: string) {
  if (!hex || hex.length % 2 !== 0) {
    throw new Error("Invalid hex");
  }

  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return bytes;
}
