#!/usr/bin/env node
// Register Discord application commands for a guild.
// Usage: APP_ID=... GUILD_ID=... BOT_TOKEN=... node scripts/register-commands.js

// Use the global `fetch` available in Node 18+. If not present, instruct how to add it.
if (typeof fetch === 'undefined') {
  console.error('Global `fetch` is not available in this Node runtime.');
  console.error('Either upgrade to Node 18+ or run `npm install node-fetch` and adjust the script.');
  process.exit(1);
}

// Flexible environment detection to handle common naming/misplacement mistakes.
const env = process.env;
function isNumeric(s) {
  return typeof s === 'string' && /^\d+$/.test(s);
}
function looksLikeToken(s) {
  return typeof s === 'string' && s.includes('.');
}

// Candidates in order of preference
const candidates = [env.APP_ID, env.APP_TOKEN, env.BOT_TOKEN, env.BOT];

// Choose APP_ID as the first numeric candidate
const APP_ID = candidates.find(isNumeric);

// Choose BOT_TOKEN as the first token-like candidate
const BOT_TOKEN = candidates.find(looksLikeToken) || env.BOT_TOKEN || env.APP_TOKEN;

const GUILD_ID = env.GUILD_ID;

if (!APP_ID || !GUILD_ID || !BOT_TOKEN) {
  console.error('Missing environment variables. Set APP_ID (numeric), GUILD_ID and BOT_TOKEN (token).');
  console.error('Detected values:', { APP_ID: env.APP_ID, APP_TOKEN: env.APP_TOKEN, BOT_TOKEN: env.BOT_TOKEN, GUILD_ID: env.GUILD_ID });
  process.exit(1);
}

const commands = [
  {
    name: 'ping',
    type: 1,
    description: 'Test command'
  },
  {
    name: 'match-status',
    type: 1,
    description: 'Show current match status'
  }
];

const url = `https://discord.com/api/v10/applications/${APP_ID}/guilds/${GUILD_ID}/commands`;

(async () => {
  // Validate command names: lowercase, 1-32 characters, letters/numbers/hyphens/underscores
  const nameRe = /^[a-z0-9_-]{1,32}$/;
  for (const cmd of commands) {
    if (!nameRe.test(cmd.name)) {
      console.error(`Invalid command name: "${cmd.name}". Use 1-32 chars: lowercase letters, numbers, '-' or '_'.`);
      process.exit(1);
    }
  }

  const res = await fetch(url, {
    method: 'PUT', // bulk overwrite for guild commands
    headers: {
      Authorization: `Bot ${BOT_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(commands)
  });

  const text = await res.text();
  console.log('Status:', res.status);
  console.log(text);
})();
