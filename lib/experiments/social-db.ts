import 'server-only'
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './social-schema'

const globalDb = globalThis as typeof globalThis & { socialPool?: Pool }
const pool = globalDb.socialPool ?? new Pool({ connectionString: process.env.DATABASE_URL, max: 3, connectionTimeoutMillis: 3000, idleTimeoutMillis: 10000, statement_timeout: 5000 })
if (process.env.NODE_ENV !== 'production') globalDb.socialPool = pool
export const socialDb = drizzle(pool, { schema })
