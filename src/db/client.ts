import { createClient } from '@libsql/client';
import path from 'path';
import fs from 'fs';

let dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  const isVercel = process.env.VERCEL === '1';
  const bundledDbPath = path.join(process.cwd(), 'src/db/local.db');

  if (isVercel) {
    const writableDbPath = '/tmp/local.db';
    try {
      if (!fs.existsSync(writableDbPath)) {
        if (fs.existsSync(bundledDbPath)) {
          fs.copyFileSync(bundledDbPath, writableDbPath);
          console.log('Successfully copied bundled DB to /tmp/local.db');
        } else {
          console.warn('Bundled database not found at:', bundledDbPath);
        }
      }
    } catch (e) {
      console.error('Failed to copy database to /tmp:', e);
    }
    dbUrl = `file:${writableDbPath}`;
  } else {
    dbUrl = `file:${bundledDbPath}`;
  }
}

const client = createClient({
  url: dbUrl,
});

export default client;
