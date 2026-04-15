/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run "npm run dev" in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run "npm run deploy" to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname !== "/interactions") {
      return new Response("Not found", { status: 404 });
    }

    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    const signature = request.headers.get("x-signature-ed25519");
    const timestamp = request.headers.get("x-signature-timestamp");

    if (!signature || !timestamp) {
      return new Response("Missing signature headers", { status: 401 });
    }

    const bodyText = await request.text();

    const isValid = await verifyDiscordSignature(
      env.DISCORD_PUBLIC_KEY.trim(),
      signature,
      timestamp,
      bodyText
    );

    if (!isValid) {
      return new Response("Bad request signature", { status: 401 });
    }

    let body;
    try {
      body = JSON.parse(bodyText);
    } catch {
      return new Response("Invalid JSON", { status: 400 });
    }

    if (body.type === 1) {
      return json({ type: 1 });
    }

    if (body.type === 2) {
      const commandName = body.data?.name;

      if (commandName === "ping") {
        return json({
          type: 4,
          data: {
            content: "Pong!",
          },
        });
      }

      return json({
        type: 4,
        data: {
          content: `Unknown command: ${commandName ?? "?"}`,
        },
      });
    }

    return json({ ok: true, body });
  },
};

async function verifyDiscordSignature(publicKeyHex, signatureHex, timestamp, bodyText) {
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

function hexToBytes(hex) {
  if (!hex || hex.length % 2 !== 0) {
    throw new Error("Invalid hex");
  }

  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return bytes;
}

function json(data, init = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(init.headers || {}),
    },
  });
}