import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  password: text('password').notNull(),
  role: text('role').default('Lead Operator'),
  avatar: text('avatar').default('silhouette'),
  approved: integer('approved', { mode: 'boolean' }).default(false)
});

export const cards = sqliteTable('cards', {
  id: text('id').primaryKey(),
  board: text('board').notNull(), // 'leads', 'quotes', 'installments', 'tasks'
  title: text('title').notNull(),
  subtitle: text('subtitle'),
  status: text('status').notNull(),
  contactName: text('contact_name'),
  email: text('email'),
  value: text('value'),
  phone: text('phone'),
  pricingMethod: text('pricing_method'),
  totalRate: text('total_rate'),
  startDate: text('start_date'),
  quoteDescription: text('quote_description'),
  details: text('details'),
  description: text('description'),
  amount: text('amount'),
  dueDate: text('due_date'),
  priority: text('priority'),
  assignee: text('assignee'),
  monthlyFee: text('monthly_fee'),
  endDate: text('end_date')
});

export const subTasks = sqliteTable('sub_tasks', {
  id: text('id').primaryKey(),
  cardId: text('card_id').references(() => cards.id, { onDelete: 'cascade' }),
  description: text('description').notNull(),
  details: text('details'),
  owner: text('owner'),
  startDate: text('start_date'),
  dueDate: text('due_date'),
  completed: integer('completed', { mode: 'boolean' }).default(false)
});

export const orgMembers = sqliteTable('org_members', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  role: text('role').notNull()
});

export const activityLogs = sqliteTable('activity_logs', {
  id: text('id').primaryKey(),
  text: text('text').notNull(),
  time: text('time').notNull(),
  board: text('board').notNull()
});
