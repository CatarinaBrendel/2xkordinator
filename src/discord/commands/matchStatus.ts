import { db } from "../../db";

export async function matchStatusCommand(env: any) {
  try {
    const database = db(env);
    const count = await database.getOpenMatchesCount();
    return {
      type: 4,
      data: { content: `Open matches: ${count}` }
    };
  } catch (err: any) {
    return { type: 4, data: { content: `DB error: ${err?.message || String(err)}` } };
  }
}
