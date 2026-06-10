import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './src/db/migrations',
  dialect: 'mysql',
  dbCredentials: {
    host:     process.env.DB_HOST     || '127.0.0.1',
    port:     Number(process.env.DB_PORT)  || 3306,
    database: process.env.DB_NAME    || '',
    user:     process.env.DB_USER    || '',
    password: process.env.DB_PASSWORD || '',
  },
});
