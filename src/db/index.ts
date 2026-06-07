import { drizzle } from 'drizzle-orm/libsql';
import client from './client';
import * as schema from './schema';

export const db = drizzle(client, { schema });
