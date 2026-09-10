/**
 * Populează `experiment_variants` din catalogul de cod (lib/experiments/catalog.ts).
 *
 * Rulare (Node 22+, `--experimental-strip-types` citește direct fișierul TypeScript):
 *   node --experimental-strip-types --env-file-if-exists=/vercel/share/.env.project scripts/seed-experiment-variants.mjs
 *
 * În producție, aceeași sincronizare se poate face prin POST /api/admin/experiments/sync?pw=…
 * Variantele scoase din catalog NU se șterg: se marchează retrase, ca statisticile deja
 * colectate să rămână interpretabile.
 */
import postgres from 'postgres'
import { ALL_VARIANTS } from '../lib/experiments/catalog.ts'

const sql = postgres(process.env.DATABASE_URL, { ssl: 'require' })

for (const v of ALL_VARIANTS) {
  await sql`
    INSERT INTO experiment_variants (id, kind, label, hypothesis, angle, motion, active, weight, launched_at)
    VALUES (${v.id}, ${v.kind}, ${v.label}, ${v.hypothesis}, ${v.angle}, ${v.motion}, ${v.active}, ${v.weight},
            ${v.active ? new Date() : null})
    ON CONFLICT (id) DO UPDATE
      SET label = EXCLUDED.label, hypothesis = EXCLUDED.hypothesis, angle = EXCLUDED.angle,
          motion = EXCLUDED.motion, active = EXCLUDED.active, weight = EXCLUDED.weight,
          retired_at = NULL, updated_at = now()`
}

const ids = ALL_VARIANTS.map((v) => v.id)
const retired = await sql`
  UPDATE experiment_variants SET active = false, retired_at = COALESCE(retired_at, now()), updated_at = now()
   WHERE id <> ALL(${ids}) AND retired_at IS NULL RETURNING id`

const rows = await sql`
  SELECT kind, count(*)::int AS total, count(*) FILTER (WHERE active)::int AS active
    FROM experiment_variants GROUP BY kind ORDER BY kind`

console.log('[experiments] variante:', rows.map((r) => `${r.kind}: ${r.active}/${r.total} active`).join(' | '))
if (retired.length) console.log('[experiments] retrase:', retired.map((r) => r.id).join(', '))
await sql.end()
