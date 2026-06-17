require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');
const routes = require('./src/routes');
const { notFound, errorHandler } = require('./src/middleware/errorHandler');

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*', credentials: true }));
app.use(express.json());

app.get('/', (req, res) => res.json({ ok: true, name: 'WorkPilot API' }));
app.use('/api', routes);

// keep these two last
app.use(notFound);
app.use(errorHandler);

// Running directly (node server.js / nodemon) -> connect then listen.
// Imported (e.g. by Vercel's serverless runtime) -> just connect and export
// the app; Vercel handles the request lifecycle, no app.listen needed.
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  (async () => {
    try {
      await connectDB();
      app.listen(PORT, () => console.log(`API listening on :${PORT}`));
    } catch (err) {
      console.error('startup failed:', err.message);
      process.exit(1);
    }
  })();
} else {
  connectDB().catch((err) => console.error('db connect error:', err.message));
}

module.exports = app;
