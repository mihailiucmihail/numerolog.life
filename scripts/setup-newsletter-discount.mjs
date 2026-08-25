import postgres from 'postgres'

const sql = postgres(process.env.DATABASE_URL, { ssl: 'require' })

await sql`ALTER TABLE newsletter_subscribers ADD COLUMN IF NOT EXISTS marketing_consent BOOLEAN NOT NULL DEFAULT FALSE`
await sql`ALTER TABLE newsletter_subscribers ADD COLUMN IF NOT EXISTS marketing_consent_at TIMESTAMPTZ`
await sql`ALTER TABLE newsletter_subscribers ADD COLUMN IF NOT EXISTS source TEXT`
await sql`ALTER TABLE newsletter_subscribers ADD COLUMN IF NOT EXISTS discount_percent INTEGER NOT NULL DEFAULT 15`
await sql`ALTER TABLE newsletter_subscribers ADD COLUMN IF NOT EXISTS discount_activated_at TIMESTAMPTZ`
await sql`CREATE INDEX IF NOT EXISTS idx_newsletter_active ON newsletter_subscribers (subscribed, discount_code)`

await sql.end()
console.log('[v0] Newsletter discount columns ready.')
