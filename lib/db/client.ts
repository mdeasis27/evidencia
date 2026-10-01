// lib/db/client.ts
// Real Postgres access (Neon serverless) for the Evidencia demo. The schema is
// isolated under the "evidencia" Postgres schema so sibling projects can share
// the same database without table collisions.

import { neon } from "@neondatabase/serverless";

export const DB_SCHEMA = "evidencia";
export const TABLES = ["answers"] as const;

export function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  return neon(url);
}
