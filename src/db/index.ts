import { drizzle } from 'drizzle-orm/mysql2';
import poolConnection from './client';
import * as leadsSchema from './schema/leads';
import * as tasksSchema from './schema/tasks';
import * as auditsSchema from './schema/audits';
import * as usersSchema from './schema/users';
import * as dealsSchema from './schema/deals';
import * as installmentsSchema from './schema/installments';

export const db = drizzle(poolConnection, {
  schema: {
    ...leadsSchema,
    ...tasksSchema,
    ...auditsSchema,
    ...usersSchema,
    ...dealsSchema,
    ...installmentsSchema,
  },
  mode: 'default',
});
