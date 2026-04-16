// Lightweight D1 helper wrapper
export function db(env: any) {
  // Accept either the `DB` binding (wrangler.jsonc) or the older `_2xkordinator_db` name
  const botDB = env.DB ?? env._2xkordinator_db;
  if (!botDB) {
    const keys = Object.keys(env || {}).join(', ');
    throw new Error(`D1 binding not found on env. Available env keys: ${keys}`);
  }

  return {
    all: async (sql: string, ...params: any[]) => await botDB.prepare(sql).bind(...params).all(),
    first: async (sql: string, ...params: any[]) => {
      const resp = await botDB.prepare(sql).bind(...params).all();
      return (resp && resp.results && resp.results[0]) || null;
    },
    run: async (sql: string, ...params: any[]) => await botDB.prepare(sql).bind(...params).run(),
    insertMatch: async (id: string, status: string, owner?: string) => {
      // New schema uses `competition_status` and `created_at_utc`; store owner in metadata JSON
      const metadata = owner ? JSON.stringify({ owner_id: owner }) : null;
      return await botDB.prepare("INSERT INTO matches (id,competition_status,metadata,created_at_utc) VALUES (?,?,?,?)").bind(id, status, metadata, Date.now()).run();
    },
    getOpenMatchesCount: async () => {
      const resp = await botDB.prepare("SELECT COUNT(*) AS cnt FROM matches WHERE competition_status = ?").bind('open').all();
      return (resp && resp.results && resp.results[0] && resp.results[0].cnt) || 0;
    }
  };
}
