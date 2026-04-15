#!/usr/bin/env node
// Register Discord application commands for a guild.
// Usage: APP_ID=... GUILD_ID=... BOT_TOKEN=... node scripts/register-commands.js

// Use the global `fetch` available in Node 18+. If not present, instruct how to add it.
if (typeof fetch === 'undefined') {
  console.error('Global `fetch` is not available in this Node runtime.');
  console.error('Either upgrade to Node 18+ or run `npm install node-fetch` and adjust the script.');
  process.exit(1);
}

// Flexible environment detection and multi-target support.
const env = process.env;
function isNumeric(s) {
  return typeof s === 'string' && /^\d+$/.test(s);
}
function looksLikeToken(s) {
  return typeof s === 'string' && s.includes('.');
}

function detectCredentials(prefix = '') {
  // prefix: '' or 'PROD_' or similar (without trailing underscore)
  const p = prefix ? `${prefix}_` : '';
  const APP_ID = env[`${p}APP_ID`] || env[`${p}APP_TOKEN`] || env.APP_ID;
  const GUILD_ID = env[`${p}GUILD_ID`] || env.GUILD_ID;
  const BOT_TOKEN = env[`${p}BOT_TOKEN`] || env[`${p}APP_TOKEN`] || env.BOT_TOKEN || env.APP_TOKEN;
  return { APP_ID, GUILD_ID, BOT_TOKEN };
}

// Parse CLI args
const args = process.argv.slice(2);
const doProd = args.includes('--prod') || args.includes('--all') || args.find(a=>a.startsWith('--target=')) === '--target=prod';
const doAll = args.includes('--all');

function requiredPresent(creds) {
  return creds.APP_ID && creds.GUILD_ID && creds.BOT_TOKEN;
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

  async function registerFor(appId, guildId, botToken, label) {
    const targetLabel = label || `${appId}@${guildId}`;
    console.log(`Registering ${commands.length} commands for ${targetLabel} ...`);
    const u = `https://discord.com/api/v10/applications/${appId}/guilds/${guildId}/commands`;
    const res = await fetch(u, {
      method: 'PUT', // bulk overwrite for guild commands
      headers: {
        Authorization: `Bot ${botToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(commands)
    });

    const text = await res.text();
    console.log(`${label || 'target'} Status:`, res.status);
    console.log(text);
  }

  // Always register dev target if available
  const devCreds = detectCredentials('');
  if (requiredPresent(devCreds)) {
    await registerFor(devCreds.APP_ID, devCreds.GUILD_ID, devCreds.BOT_TOKEN, 'dev');
  } else {
    console.warn('Dev credentials not fully configured; skipping dev registration.');
    console.warn({ APP_ID: env.APP_ID, APP_TOKEN: env.APP_TOKEN, BOT_TOKEN: env.BOT_TOKEN, GUILD_ID: env.GUILD_ID });
  }

  // Optionally register prod target only if explicitly requested and creds present
  if (doProd || doAll) {
    const prodCreds = detectCredentials('PROD');
    if (requiredPresent(prodCreds)) {
      await registerFor(prodCreds.APP_ID, prodCreds.GUILD_ID, prodCreds.BOT_TOKEN, 'prod');
    } else {
      console.warn('Prod credentials not found or incomplete; skipping prod registration.');
      console.warn({ APP_ID_PROD: env.APP_ID_PROD, APP_TOKEN_PROD: env.APP_TOKEN_PROD, BOT_TOKEN_PROD: env.BOT_TOKEN_PROD, GUILD_ID_PROD: env.GUILD_ID_PROD });
    }
  } else {
    console.log('Prod registration skipped. To register prod, run with `--prod` or `--all` and set PROD_APP_ID/PROD_BOT_TOKEN/PROD_GUILD_ID or APP_ID_PROD/BOT_TOKEN_PROD/GUILD_ID_PROD in env.');
  }

})();
