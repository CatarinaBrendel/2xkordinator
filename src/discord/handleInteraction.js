import { pingCommand } from "./commands/ping.js";
import { matchStatusCommand } from "./commands/matchStatus.js";

export async function handleInteraction(body, env) {
  if (!body || !body.type) return { ok: false };

  if (body.type === 1) {
    return { type: 1 };
  }

  if (body.type === 2) {
    const commandName = body.data?.name;

    switch (commandName) {
      case "ping":
        return pingCommand();
      case "match-status":
        return matchStatusCommand(env);
      default:
        return {
          type: 4,
          data: { content: `Unknown command: ${commandName ?? "?"}` },
        };
    }
  }

  return { ok: true };
}
