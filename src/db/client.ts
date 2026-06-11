import mysql from 'mysql2/promise';

// Validate required environment variables at startup
const missingVars: string[] = [];
if (!process.env.DB_NAME)     missingVars.push('DB_NAME');
if (!process.env.DB_USER)     missingVars.push('DB_USER');
if (!process.env.DB_PASSWORD) missingVars.push('DB_PASSWORD');

if (missingVars.length > 0) {
  console.error(
    `[DB] FATAL: Missing required environment variables: ${missingVars.join(', ')}.\n` +
    `[DB] Ensure a .env file exists in the app root with DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD, DB_SSL.\n` +
    `[DB] The app will continue but ALL database operations will fail.`
  );
}

// All credentials come from environment variables — never hardcoded
const pool = mysql.createPool({
  host:               process.env.DB_HOST     || '127.0.0.1',
  port:               Number(process.env.DB_PORT) || 3306,
  database:           process.env.DB_NAME     || 'unknown_db',
  user:               process.env.DB_USER     || 'unknown_user',
  password:           process.env.DB_PASSWORD || '',
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0,
  connectTimeout:     10000,
  // Required for Hostinger shared hosting which uses self-signed certs
  ssl: process.env.DB_SSL === 'true' ? {} : undefined,
});

// Log successful pool creation
console.log(
  `[DB] Pool created → host=${process.env.DB_HOST || '127.0.0.1'} ` +
  `db=${process.env.DB_NAME || 'MISSING'} ` +
  `user=${process.env.DB_USER || 'MISSING'}`
);

export default pool;
