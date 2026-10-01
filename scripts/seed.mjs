// scripts/seed.mjs
// Creates the evidencia schema + answers table and seeds sample history rows.
// Run: node scripts/seed.mjs  (requires DATABASE_URL in env or .env.local)

import { readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";

function loadEnv() {
  try {
    const raw = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
    for (const line of raw.split("\n")) {
      const m = line.trim().match(/^([A-Z0-9_]+)=(.*)$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
    }
  } catch {
    /* no .env.local */
  }
}

loadEnv();

const sql = neon(process.env.DATABASE_URL);

const ANSWERS = [
  ["¿Cuál es la tasa de interés de mora para créditos de consumo?", "answered", 1.0],
  ["¿Cuál es el plazo máximo de un crédito de consumo?", "answered", 1.0],
  ["¿Cuánto es la comisión por prepago de un crédito de consumo?", "refused", 1.0],
];

async function main() {
  await sql`CREATE SCHEMA IF NOT EXISTS evidencia`;
  await sql`DROP TABLE IF EXISTS evidencia.answers`;

  await sql`
    CREATE TABLE evidencia.answers (
      id serial PRIMARY KEY,
      query text NOT NULL,
      status text NOT NULL,
      attribution numeric NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    )`;

  for (const [query, status, attribution] of ANSWERS) {
    await sql`INSERT INTO evidencia.answers (query, status, attribution) VALUES (${query}, ${status}, ${attribution})`;
  }

  const [{ c }] = await sql`SELECT count(*)::int AS c FROM evidencia.answers`;
  console.log(`Seeded evidencia schema: ${c} answers`);
}

main().catch((e) => {
  console.error("Seed failed:", e.message);
  process.exit(1);
});
