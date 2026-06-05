import { drizzle } from 'drizzle-orm/mysql2';
import poolConnection from './client';
import * as leadsSchema from './schema/leads';
import * as tasksSchema from './schema/tasks';
import * as auditsSchema from './schema/audits';
import * as usersSchema from './schema/users';

export const db = drizzle(poolConnection, {
  schema: {
    ...leadsSchema,
    ...tasksSchema,
    ...auditsSchema,
    ...usersSchema,
  },
  mode: 'default',
});
