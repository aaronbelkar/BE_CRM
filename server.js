// Load environment variables from .env file before anything else
// This is needed for Hostinger Passenger which doesn't auto-inject env vars
const path = require('path');
const envPath = path.join(__dirname, '.env');
try {
  const result = require('dotenv').config({ path: envPath });
  if (result.error) {
    console.error(`[server] Failed to load .env from ${envPath}:`, result.error.message);
    console.error(`[server] DB operations will fail. Create a .env file at: ${envPath}`);
  } else {
    console.log(`[server] Loaded .env from ${envPath}`);
    console.log(`[server] DB_HOST=${process.env.DB_HOST}, DB_NAME=${process.env.DB_NAME}, DB_USER=${process.env.DB_USER}, DB_SSL=${process.env.DB_SSL}`);
  }
} catch (e) {
  console.error(`[server] dotenv not available or failed:`, e.message);
}

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = false;
const app = next({ dev });
const handle = app.getRequestHandler();

const port = process.env.PORT || 3000;

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  }).listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
});
