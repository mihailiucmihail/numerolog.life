// Fațete („Grani”) cumpărate separat: `unlocked_grani` = lista id-urilor (1..14) deschise pe raport.
// NULL = raport COMPLET (toate rapoartele existente rămân complete).
// Rulare: node --env-file-if-exists=/vercel/share/.env.project scripts/add-cristalul-unlocked-grani.mjs
import postgres from 'postgres'
const sql = postgres(process.env.DATABASE_URL, { ssl: 'require' })

await sql`ALTER TABLE cristalul_rapoarte ADD COLUMN IF NOT EXISTS unlocked_grani smallint[]`
await sql`ALTER TABLE cristalul_rapoarte ADD COLUMN IF NOT EXISTS updated_at timestamptz`
await sql`CREATE INDEX IF NOT EXISTS cristalul_rapoarte_session_idx ON cristalul_rapoarte (session_id)`

const [{ count }] = await sql`SELECT count(*)::int AS count FROM cristalul_rapoarte WHERE unlocked_grani IS NOT NULL`
console.log(`OK: coloana unlocked_grani există; rapoarte parțiale: ${count}`)
await sql.end()
