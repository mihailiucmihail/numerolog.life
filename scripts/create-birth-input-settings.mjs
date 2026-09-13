/**
 * Migrare ADITIVĂ: tabelul de configurație al experimentului „formular complet vs. numai data nașterii”.
 * Un singur rând per experiment; implicit INACTIV, 0%/0%. Nu atinge tabelele existente.
 *
 * Rulare:
 *   node --env-file-if-exists=/vercel/share/.env.project scripts/create-birth-input-settings.mjs
 */
import postgres from 'postgres'

const url = process.env.DATABASE_URL
if (!url) {
  console.error('DATABASE_URL is not set')
  process.exit(1)
}

const db = postgres(url, { ssl: 'require' })

try {
  await db`
    CREATE TABLE IF NOT EXISTS birth_input_settings (
      experiment text PRIMARY KEY,
      enabled boolean NOT NULL DEFAULT false,
      pct_a integer NOT NULL DEFAULT 0,
      pct_b integer NOT NULL DEFAULT 0,
      updated_at timestamptz NOT NULL DEFAULT now()
    )`
  await db`
    INSERT INTO birth_input_settings (experiment, enabled, pct_a, pct_b)
    VALUES ('birth-input-v1', false, 0, 0)
    ON CONFLICT (experiment) DO NOTHING`
  const [row] = await db`SELECT experiment, enabled, pct_a, pct_b FROM birth_input_settings WHERE experiment = 'birth-input-v1'`
  console.log('[birth-input] settings row:', row)
} finally {
  await db.end()
}
