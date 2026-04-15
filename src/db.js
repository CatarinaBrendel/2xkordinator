// Lightweight D1 helper wrapper
export function db(env) {
  const botDB = env._2xkordinator_db;
  if (!botDB) throw new Error('D1 binding not found on env');

  return {
    all: async (sql, ...params) => await d.prepare(sql).bind(...params).all(),
    first: async (sql, ...params) => {
      const resp = await botDB.prepare(sql).bind(...params).all();
      return (resp && resp.results && resp.results[0]) || null;
    },
    run: async (sql, ...params) => await botDB.prepare(sql).bind(...params).run(),
    insertMatch: async (id, status, owner) =>
      await botDB.prepare("INSERT INTO matches (id,status,owner_id,created_at) VALUES (?,?,?,?)").bind(id, status, owner, Date.now()).run(),
    getOpenMatchesCount: async () => {
      const resp = await botDB.prepare("SELECT COUNT(*) AS cnt FROM matches WHERE status = ?").bind('open').all();
      return (resp && resp.results && resp.results[0] && resp.results[0].cnt) || 0;
    }
  };
}
