#!/usr/bin/env node
// Creates or resets the password for an admin login.
// Usage: node scripts/create-admin.mjs admin@aquatace.co.ke 'a-strong-password'
//
// Reads DATABASE_URL from the environment, falling back to a .env file in the
// current directory.

import { readFileSync, existsSync } from "node:fs";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const [, , email, password] = process.argv;

if (!email || !password) {
  console.error("Usage: node scripts/create-admin.mjs <email> <password>");
  process.exit(1);
}

let databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl && existsSync(".env")) {
  const match = readFileSync(".env", "utf8").match(/^DATABASE_URL=(.*)$/m);
  if (match) databaseUrl = match[1].trim().replace(/^['"]|['"]$/g, "");
}
if (!databaseUrl) {
  console.error("DATABASE_URL not found in environment or .env");
  process.exit(1);
}

const pool = new Pool({ connectionString: databaseUrl });
const passwordHash = await bcrypt.hash(password, 12);

const { rows } = await pool.query(
  `INSERT INTO admin_users (email, password_hash)
   VALUES ($1, $2)
   ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash
   RETURNING id, email`,
  [email, passwordHash],
);

console.log(`Admin ready: ${rows[0].email} (${rows[0].id})`);
await pool.end();
