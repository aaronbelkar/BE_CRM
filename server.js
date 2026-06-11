// Load environment variables from .env file before anything else
// This is needed for Hostinger Passenger which doesn't auto-inject env vars
try {
  require('dotenv').config({ path: require('path').join(__dirname, '.env') });
} catch (e) {
  // dotenv not available, rely on process.env set by the hosting panel
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
