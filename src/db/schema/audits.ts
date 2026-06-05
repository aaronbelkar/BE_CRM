import { mysqlTable, int, varchar, timestamp } from 'drizzle-orm/mysql-core';

export const actorTypeEnum = ['OPERATOR', 'AGENT_CHUCK'] as const;
export const entityTypeEnum = ['LEAD', 'TASK'] as const;

export const auditLogs = mysqlTable('audit_logs', {
  id: int('id').primaryKey().autoincrement(),
  actor: varchar('actor', { length: 50, enum: actorTypeEnum }).notNull(),
  entityType: varchar('entity_type', { length: 50, enum: entityTypeEnum }).notNull(),
  entityId: varchar('entity_id', { length: 255 }).notNull(),
  oldStatus: varchar('old_status', { length: 50 }).notNull(),
  newStatus: varchar('new_status', { length: 50 }).notNull(),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
});
