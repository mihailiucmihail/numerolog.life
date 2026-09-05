// Oferta −20 % pentru lead-uri: expirare pe codurile promo + dezabonare și monedă pe lead-uri.
// Rulare: node --env-file-if-exists=/vercel/share/.env.project scripts/migrate-offer-20.mjs
import postgres from 'postgres'
const sql = postgres(process.env.DATABASE_URL, { ssl: 'require' })
await sql`ALTER TABLE promo_codes ADD COLUMN IF NOT EXISTS expires_at timestamptz`
await sql`ALTER TABLE cristalul_previews ADD COLUMN IF NOT EXISTS unsubscribe_token text UNIQUE`
await sql`ALTER TABLE cristalul_previews ADD COLUMN IF NOT EXISTS unsubscribed_at timestamptz`
await sql`ALTER TABLE cristalul_previews ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'eur'`
await sql`ALTER TABLE cristalul_previews ADD COLUMN IF NOT EXISTS offer_code text`
console.log('migration ok')
await sql.end()
