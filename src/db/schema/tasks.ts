import { mysqlTable, varchar, int, text, timestamp } from 'drizzle-orm/mysql-core';
import { leads } from './leads';

export const taskStatusEnum = ['BACKLOG', 'ASSIGNED', 'IN_PROGRESS', 'REVIEW', 'DONE'] as const;

export const tasks = mysqlTable('tasks', {
  id: varchar('id', { length: 36 }).primaryKey(), // UUID
  leadId: int('lead_id').references(() => leads.id, { onDelete: 'set null' }),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  status: varchar('status', { length: 50, enum: taskStatusEnum }).default('BACKLOG').notNull(),
  progressUpdates: text('progress_updates'),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});
