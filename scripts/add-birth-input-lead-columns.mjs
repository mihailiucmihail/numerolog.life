/**
 * Migrare ADITIVĂ: coloane pentru atribuirea experimentului „formular complet vs. numai data nașterii”
 * pe leadurile de previzualizare. NULL cât testul e oprit — nu schimbă nimic din comportamentul actual.
 *
 * Rulare:
 *   node --env-file-if-exists=/vercel/share/.env.project scripts/add-birth-input-lead-columns.mjs
 */
import postgres from 'postgres'

const url = process.env.DATABASE_URL
if (!url) {
  console.error('DATABASE_URL is not set')
  process.exit(1)
}

const db = postgres(url, { ssl: 'require' })

try {
  await db`ALTER TABLE cristalul_previews ADD COLUMN IF NOT EXISTS bi_arm text`
  await db`ALTER TABLE cristalul_previews ADD COLUMN IF NOT EXISTS bi_enrollment text`
  const cols = await db`
    SELECT column_name FROM information_schema.columns
    WHERE table_name = 'cristalul_previews' AND column_name IN ('bi_arm', 'bi_enrollment')
    ORDER BY column_name`
  console.log('[birth-input] lead columns:', cols.map((c) => c.column_name).join(', '))
} finally {
  await db.end()
}
