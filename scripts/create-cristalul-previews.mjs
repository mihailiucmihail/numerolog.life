// Tabelul lead-urilor: fiecare previzualizare blurată (formular completat, neplătit) a Cristalului Destinului.
// Rulare: node --env-file-if-exists=/vercel/share/.env.project scripts/create-cristalul-previews.mjs
import postgres from 'postgres'
const sql = postgres(process.env.DATABASE_URL, { ssl: 'require' })
await sql`
  CREATE TABLE IF NOT EXISTS cristalul_previews (
    id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_key             text UNIQUE NOT NULL,
    email                text NOT NULL,
    first_name           text,
    last_name            text,
    birth_day            int,
    birth_month          int,
    birth_year           int,
    form_data            jsonb NOT NULL,
    locale               text DEFAULT 'ru',
    views                int NOT NULL DEFAULT 1,
    created_at           timestamptz NOT NULL DEFAULT now(),
    last_seen_at         timestamptz NOT NULL DEFAULT now(),
    paid_at              timestamptz,
    paid_token           text,
    permanent_token      text,
    permanent_created_at timestamptz,
    offer_sent_at        timestamptz,
    offer_sent_count     int NOT NULL DEFAULT 0
  )`
await sql`CREATE INDEX IF NOT EXISTS cristalul_previews_email_idx ON cristalul_previews (lower(email))`
await sql`CREATE INDEX IF NOT EXISTS cristalul_previews_created_idx ON cristalul_previews (created_at DESC)`
const [{ count }] = await sql`SELECT count(*)::int AS count FROM cristalul_previews`
console.log('cristalul_previews ready, rows:', count)
await sql.end()
