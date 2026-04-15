import { db } from "../../db.js";

export async function matchStatusCommand(env) {
  try {
        const database = db(env);
        const count = await database.getOpenMatchesCount();
        return {
            type: 4,
            data: { content: `Open matches: ${count}` }
        };
    } catch (err) {
        return { type: 4, data: { content: `DB error: ${err.message}` } };
    }
}
