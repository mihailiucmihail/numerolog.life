// Evidența clickurilor pe butonul de plată al Cristalului: fiecare apel al startNumerologieCheckout
// (sesiune Stripe creată sau eșuată) + contor pe lead în cristalul_previews.
// Rulare: node --env-file-if-exists=/vercel/share/.env.project scripts/create-cristalul-checkout-attempts.mjs
import postgres from 'postgres'
const sql = postgres(process.env.DATABASE_URL, { ssl: 'require' })

await sql`
  CREATE TABLE IF NOT EXISTS cristalul_checkout_attempts (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id       uuid,
    lead_key      text,
    email         text,
    first_name    text,
    last_name     text,
    country       text,
    currency      text,
    amount        numeric(12, 2),
    display_price text,
    promo_code    text,
    locale        text,
    session_id    text,
    status        text NOT NULL,
    error         text,
    created_at    timestamptz NOT NULL DEFAULT now()
  )`
await sql`CREATE INDEX IF NOT EXISTS cristalul_checkout_attempts_created_idx ON cristalul_checkout_attempts (created_at DESC)`
await sql`CREATE INDEX IF NOT EXISTS cristalul_checkout_attempts_email_idx ON cristalul_checkout_attempts (lower(email))`
await sql`CREATE INDEX IF NOT EXISTS cristalul_checkout_attempts_lead_idx ON cristalul_checkout_attempts (lead_id)`

await sql`ALTER TABLE cristalul_previews ADD COLUMN IF NOT EXISTS checkout_clicks int NOT NULL DEFAULT 0`
await sql`ALTER TABLE cristalul_previews ADD COLUMN IF NOT EXISTS last_checkout_at timestamptz`

const [{ count }] = await sql`SELECT count(*)::int AS count FROM cristalul_checkout_attempts`
console.log('cristalul_checkout_attempts ready, rows:', count)
await sql.end()
