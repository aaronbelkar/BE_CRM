import { mysqlTable, varchar, timestamp } from 'drizzle-orm/mysql-core';

export const dealStatusEnum = ['NEW', 'IN_PROGRESS', 'DEPLOYED', 'COLLECTED'] as const;

export const deals = mysqlTable('deals', {
  id: varchar('id', { length: 36 }).primaryKey(), // UUID
  title: varchar('title', { length: 255 }).notNull(),
  value: varchar('value', { length: 50 }).notNull(), // e.g. "$12,000" or numeric string
  status: varchar('status', { length: 50, enum: dealStatusEnum }).default('NEW').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});
