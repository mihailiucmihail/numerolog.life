import postgres from 'postgres'

const sql = postgres(process.env.DATABASE_URL, { ssl: 'require' })

await sql`
  CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    first_name TEXT,
    last_name TEXT,
    locale TEXT DEFAULT 'ru',
    discount_code TEXT,
    subscribed BOOLEAN DEFAULT TRUE,
    unsubscribe_token TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    unsubscribed_at TIMESTAMPTZ
  )
`

await sql`
  CREATE TABLE IF NOT EXISTS newsletter_campaigns (
    id SERIAL PRIMARY KEY,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    recipients_count INTEGER DEFAULT 0,
    sent_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
  )
`

await sql`CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscribers (email)`
await sql`CREATE INDEX IF NOT EXISTS idx_newsletter_token ON newsletter_subscribers (unsubscribe_token)`

const cols = await sql`
  SELECT column_name FROM information_schema.columns WHERE table_name = 'newsletter_subscribers' ORDER BY ordinal_position
`
console.log('[v0] newsletter_subscribers columns:', cols.map((c) => c.column_name).join(', '))

await sql.end()
console.log('[v0] Newsletter tables ready.')
