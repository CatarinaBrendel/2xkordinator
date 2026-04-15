/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run "npm run dev" in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run "npm run deploy" to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import { verifyDiscordSignature } from "./discord/verify.js";
import { handleInteraction } from "./discord/handleInteraction.js";

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
      env.APP_PUBLIC_KEY.trim(),
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

    const result = await handleInteraction(body, env);

    if (result && result.type) {
      return json(result);
    }

    return json({ ok: true, body });
  },
};

function json(data, init = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(init.headers || {}),
    },
  });
}