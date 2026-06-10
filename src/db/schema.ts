import { mysqlTable, varchar, text, boolean, int } from 'drizzle-orm/mysql-core';

export const users = mysqlTable('users', {
  id:       varchar('id', { length: 64 }).primaryKey(),
  name:     varchar('name', { length: 128 }).notNull(),
  email:    varchar('email', { length: 255 }).notNull(),
  password: varchar('password', { length: 255 }).notNull(),
  role:     varchar('role', { length: 64 }).default('Lead Operator'),
  avatar:   varchar('avatar', { length: 128 }).default('silhouette'),
  approved: boolean('approved').default(false),
});

export const cards = mysqlTable('cards', {
  id:               varchar('id', { length: 64 }).primaryKey(),
  board:            varchar('board', { length: 64 }).notNull(),
  title:            varchar('title', { length: 255 }).notNull(),
  subtitle:         varchar('subtitle', { length: 255 }),
  status:           varchar('status', { length: 128 }).notNull(),
  contactName:      varchar('contact_name', { length: 255 }),
  email:            varchar('email', { length: 255 }),
  value:            varchar('value', { length: 64 }),
  phone:            varchar('phone', { length: 64 }),
  pricingMethod:    varchar('pricing_method', { length: 128 }),
  totalRate:        varchar('total_rate', { length: 64 }),
  startDate:        varchar('start_date', { length: 32 }),
  quoteDescription: text('quote_description'),
  details:          text('details'),
  description:      text('description'),
  amount:           varchar('amount', { length: 64 }),
  dueDate:          varchar('due_date', { length: 32 }),
  priority:         varchar('priority', { length: 64 }),
  assignee:         varchar('assignee', { length: 128 }),
  monthlyFee:       varchar('monthly_fee', { length: 64 }),
  endDate:          varchar('end_date', { length: 32 }),
});

export const subTasks = mysqlTable('sub_tasks', {
  id:          varchar('id', { length: 64 }).primaryKey(),
  cardId:      varchar('card_id', { length: 64 }).references(() => cards.id, { onDelete: 'cascade' }),
  description: varchar('description', { length: 255 }).notNull(),
  details:     text('details'),
  owner:       varchar('owner', { length: 128 }),
  startDate:   varchar('start_date', { length: 32 }),
  dueDate:     varchar('due_date', { length: 32 }),
  completed:   boolean('completed').default(false),
});

export const orgMembers = mysqlTable('org_members', {
  id:   varchar('id', { length: 64 }).primaryKey(),
  name: varchar('name', { length: 128 }).notNull(),
  role: varchar('role', { length: 128 }).notNull(),
});

export const activityLogs = mysqlTable('activity_logs', {
  id:    varchar('id', { length: 64 }).primaryKey(),
  text:  text('text').notNull(),
  time:  varchar('time', { length: 64 }).notNull(),
  board: varchar('board', { length: 64 }).notNull(),
});
