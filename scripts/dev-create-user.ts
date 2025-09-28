// Create or update an admin user in local SQLite (db/app.db)
// Usage: deno run --allow-read --allow-write --allow-env scripts/dev-create-user.ts --username user --password pass

import { DB } from "https://deno.land/x/sqlite@v3.9.1/mod.ts";

function parseArgs() {
  const args = Deno.args;
  let username = "";
  let password = "";
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--username") username = args[++i] || "";
    else if (a === "--password") password = args[++i] || "";
  }
  if (!username || !password) {
    console.error("Usage: --username <email> --password <password>");
    Deno.exit(1);
  }
  return { username, password };
}

function randToken(): string {
  const u = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(u).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function sha256Hex(input: string): Promise<string> {
  const enc = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, "0")).join("");
}

async function main() {
  const { username, password } = parseArgs();
  await Deno.mkdir("db", { recursive: true }).catch(() => {});
  const db = new DB("db/app.db");
  try {
    db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        pass_hash TEXT NOT NULL,
        salt TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS sessions (
        token TEXT PRIMARY KEY,
        user_id INTEGER NOT NULL,
        expires INTEGER NOT NULL
      );
    `);

    // See if user exists
    const existing = Array.from(db.query("SELECT id, salt FROM users WHERE username = ?", [username])) as any[];
    const salt = randToken();
    const pass_hash = await sha256Hex(`${salt}:${password}`);

    if (existing.length > 0) {
      const id = existing[0][0] as number;
      db.query("UPDATE users SET pass_hash = ?, salt = ? WHERE id = ?", [pass_hash, salt, id]);
      console.log(`Updated password for user ${username}`);
    } else {
      db.query("INSERT INTO users (username, pass_hash, salt) VALUES (?, ?, ?)", [username, pass_hash, salt]);
      console.log(`Created user ${username}`);
    }
  } finally {
    db.close();
  }
}

if (import.meta.main) {
  main().catch((e) => { console.error(e); Deno.exit(1); });
}

