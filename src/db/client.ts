import mysql from 'mysql2/promise';

// All credentials come from environment variables — never hardcoded
const pool = mysql.createPool({
  host:     process.env.DB_HOST     || '127.0.0.1',
  port:     Number(process.env.DB_PORT)  || 3306,
  database: process.env.DB_NAME,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // Required for Hostinger shared hosting which uses self-signed certs
  ssl: process.env.DB_SSL === 'true' ? {} : undefined,
});

export default pool;
