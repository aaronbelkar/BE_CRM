import { mysqlTable, varchar, timestamp } from 'drizzle-orm/mysql-core';

export const installmentStatusEnum = ['NEW', 'IN_PROGRESS', 'ON_HOLD', 'DONE'] as const;

export const installments = mysqlTable('installments', {
  id: varchar('id', { length: 36 }).primaryKey(), // UUID
  title: varchar('title', { length: 255 }).notNull(),
  amount: varchar('amount', { length: 50 }).notNull(), // e.g. "$1,500" or numeric string
  status: varchar('status', { length: 50, enum: installmentStatusEnum }).default('NEW').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});
