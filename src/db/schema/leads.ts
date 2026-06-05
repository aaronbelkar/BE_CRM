import { mysqlTable, int, varchar, timestamp } from 'drizzle-orm/mysql-core';

export const leadStatusEnum = ['NEW', 'PENDING_CONTACT', 'QUALIFIED', 'PROPOSAL', 'WON', 'LOST'] as const;

export const leads = mysqlTable('leads', {
  id: int('id').primaryKey().autoincrement(),
  companyName: varchar('company_name', { length: 255 }).notNull(),
  contactName: varchar('contact_name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  status: varchar('status', { length: 50, enum: leadStatusEnum }).default('NEW').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});
