import { pgTable, uuid, text, varchar, timestamp, boolean, integer, jsonb } from 'drizzle-orm/pg-core'
import type { SocialTouch } from './social-attribution'

export const socialTouches = pgTable('social_touches', {
  id: uuid('id').primaryKey(), visitorId: text('visitor_id').notNull(),
  source: varchar('source', { length: 80 }).notNull(), medium: varchar('medium', { length: 80 }).notNull(),
  campaign: varchar('campaign', { length: 80 }).notNull(), content: varchar('content', { length: 80 }).notNull(),
  landingPath: varchar('landing_path', { length: 240 }).notNull(), referrer: varchar('referrer', { length: 240 }),
  firstSource: jsonb('first_source').$type<SocialTouch>().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull(), isTest: boolean('is_test').notNull().default(false),
})
export const socialEvents = pgTable('social_events', {
  id: uuid('id').primaryKey().defaultRandom(), touchId: uuid('touch_id').notNull(), visitorId: text('visitor_id').notNull(),
  event: varchar('event', { length: 40 }).notNull(), path: varchar('path', { length: 240 }), previousPath: varchar('previous_path', { length: 240 }),
  formVariant: text('form_variant'), previewVariant: text('preview_variant'), product: varchar('product', { length: 40 }),
  amountMinor: integer('amount_minor'), currency: varchar('currency', { length: 8 }), dedupKey: text('dedup_key').notNull().unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})
export const socialFunnelSettings = pgTable('social_funnel_settings', {
  key: text('key').primaryKey(), active: boolean('active').notNull().default(false), percentage: integer('percentage').notNull().default(0),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})
