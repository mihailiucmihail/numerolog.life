import postgres from 'postgres'

const sql = postgres(process.env.DATABASE_URL, { ssl: 'require' })

// Coduri promoționale unice, de unică folosință (un cod per abonat).
await sql`
  CREATE TABLE IF NOT EXISTS promo_codes (
    code TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    percent INTEGER NOT NULL DEFAULT 15,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    used_at TIMESTAMPTZ,
    used_session_id TEXT,
    used_email TEXT
  )
`
await sql`CREATE INDEX IF NOT EXISTS idx_promo_codes_email ON promo_codes (email)`
await sql`CREATE INDEX IF NOT EXISTS idx_promo_codes_used ON promo_codes (used_at)`

await sql.end()
console.log('[v0] promo_codes table ready.')
