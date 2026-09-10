/**
 * Schema pentru experimentele FORM / PREVIEW (Cristalul destinului).
 *
 * Rulare:
 *   node --env-file-if-exists=/vercel/share/.env.project scripts/create-experiments.mjs
 *
 * Idempotent: se poate rula de mai multe ori. Nu modifică datele existente — doar adaugă
 * tabele noi și coloane nullable pe tabelele deja folosite (lead-uri, rapoarte, tentative de plată),
 * astfel încât lead-urile de dinainte de experiment rămân valide (variantă = NULL).
 */
import postgres from 'postgres'

const sql = postgres(process.env.DATABASE_URL, { ssl: 'require' })

async function main() {
  // Registrul variantelor: sursa de adevăr rămâne lib/experiments/catalog.ts, aici păstrăm
  // istoricul pentru rapoarte (o variantă oprită trebuie să rămână interpretabilă în statistici).
  await sql`
    CREATE TABLE IF NOT EXISTS experiment_variants (
      id            text PRIMARY KEY,
      kind          text NOT NULL CHECK (kind IN ('form','preview','price')),
      label         text NOT NULL,
      hypothesis    text,
      angle         text,
      motion        smallint NOT NULL DEFAULT 1,
      active        boolean NOT NULL DEFAULT false,
      weight        real NOT NULL DEFAULT 1,
      launched_at   timestamptz,
      retired_at    timestamptz,
      created_at    timestamptz NOT NULL DEFAULT now(),
      updated_at    timestamptz NOT NULL DEFAULT now()
    )`

  // O linie per vizitator: atribuirea sticky, plus contextul de intrare (temă, UTM, țară).
  await sql`
    CREATE TABLE IF NOT EXISTS experiment_assignments (
      visitor_id      text PRIMARY KEY,
      form_variant    text NOT NULL,
      preview_variant text NOT NULL,
      price_variant   text,
      entry           text,
      locale          text,
      country         text,
      device          text,
      utm_source      text,
      utm_medium      text,
      utm_campaign    text,
      utm_content     text,
      referrer        text,
      assigned_at     timestamptz NOT NULL DEFAULT now(),
      last_seen_at    timestamptz NOT NULL DEFAULT now(),
      is_internal     boolean NOT NULL DEFAULT false
    )`

  // Evenimentele de funnel. `dedup_key` este unic → un eveniment „o singură dată per vizitator”
  // (expunere, CTA vizibil, plată) nu poate fi numărat de două ori la refresh sau retrimitere.
  await sql`
    CREATE TABLE IF NOT EXISTS experiment_events (
      id              bigserial PRIMARY KEY,
      visitor_id      text NOT NULL,
      event           text NOT NULL,
      form_variant    text,
      preview_variant text,
      entry           text,
      locale          text,
      country         text,
      device          text,
      value_amount    integer,
      value_currency  text,
      meta            jsonb,
      dedup_key       text UNIQUE,
      created_at      timestamptz NOT NULL DEFAULT now()
    )`

  await sql`CREATE INDEX IF NOT EXISTS experiment_events_visitor_idx ON experiment_events (visitor_id)`
  await sql`CREATE INDEX IF NOT EXISTS experiment_events_event_idx ON experiment_events (event, created_at DESC)`
  await sql`CREATE INDEX IF NOT EXISTS experiment_events_form_idx ON experiment_events (form_variant, event)`
  await sql`CREATE INDEX IF NOT EXISTS experiment_events_preview_idx ON experiment_events (preview_variant, event)`
  await sql`CREATE INDEX IF NOT EXISTS experiment_assignments_seen_idx ON experiment_assignments (last_seen_at DESC)`

  // Legătura cu tabelele existente: lead, raport permanent, tentativă de plată.
  for (const table of ['cristalul_previews', 'cristalul_rapoarte', 'cristalul_checkout_attempts']) {
    await sql`ALTER TABLE ${sql(table)} ADD COLUMN IF NOT EXISTS visitor_id text`
    await sql`ALTER TABLE ${sql(table)} ADD COLUMN IF NOT EXISTS form_variant text`
    await sql`ALTER TABLE ${sql(table)} ADD COLUMN IF NOT EXISTS preview_variant text`
  }
  await sql`CREATE INDEX IF NOT EXISTS cristalul_previews_visitor_idx ON cristalul_previews (visitor_id)`
  await sql`CREATE INDEX IF NOT EXISTS cristalul_rapoarte_visitor_idx ON cristalul_rapoarte (visitor_id)`

  const [{ count: variants }] = await sql`SELECT count(*)::int AS count FROM experiment_variants`
  console.log('[experiments] schema pregătită; variante în registru:', variants)
  await sql.end()
}

main().catch(async (error) => {
  console.error('[experiments] eroare:', error)
  await sql.end({ timeout: 5 })
  process.exit(1)
})
