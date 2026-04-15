Migration notes
---------------

Files in this folder:

- `001_create_schema.sql` — initial tables: `users`, `matches`, `guild_settings`
- `002_indexes.sql` — indexes for common queries

Applying migrations
-------------------
These SQL files can be applied using Cloudflare's dashboard or the Wrangler CLI. Examples:

1) Using the Cloudflare Dashboard
   - Open the D1 database (2xkordinator-db) in the Cloudflare dashboard
   - Run the SQL files in order (copy/paste or upload)

2) Using Wrangler locally:
   - Apply a single SQL file (note: `wrangler d1 execute` expects the database name as the first positional argument):

     npx wrangler d1 execute 2xkordinator-db --file migrations/001_create_schema.sql

   - Then apply indexes:

     npx wrangler d1 execute 2xkordinator-db --file migrations/002_indexes.sql

   - Or run both in sequence (example using npm script):

     npm run migrate

   - Example `package.json` script (add under `scripts`):

     "migrate": "npx wrangler d1 execute 2xkordinator-db --file migrations/001_create_schema.sql && npx wrangler d1 execute 2xkordinator-db --file migrations/002_indexes.sql"

Notes
-----
- Wrangler/D1 command names or flags may vary by version; if `d1 execute` is unavailable use the Cloudflare UI.
- Keep migration files under version control and update them when schema changes.
- Test migrations against a dev database before applying to production.
