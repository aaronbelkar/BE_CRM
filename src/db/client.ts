import mysql from 'mysql2/promise';

const dbHost = process.env.DATABASE_HOST;
const dbUser = process.env.DATABASE_USER;
const dbPassword = process.env.DATABASE_PASSWORD;
const dbName = process.env.DATABASE_NAME;
const dbPort = Number(process.env.DATABASE_PORT) || 3306;

// Create connection pool matching Hostinger connection limit parameters
const poolConnection = mysql.createPool({
  host: dbHost,
  user: dbUser,
  password: dbPassword,
  database: dbName,
  port: dbPort,
  connectionLimit: 10, // Safeguard for Hostinger concurrent limits
});

export default poolConnection;
