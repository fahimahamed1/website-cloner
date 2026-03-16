const express = require('express');
const path = require('path');
const setupRoutes = require('./routes');
const { DEFAULTS } = require('./config/constants');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '..', 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));

setupRoutes(app);

process.on('SIGTERM', () => {
  console.log('Shutting down...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('Shutting down...');
  process.exit(0);
});

const PORT = process.env.PORT || DEFAULTS.PORT;
app.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════════════════════╗
  ║   Website Login Page Cloner v1                    ║
  ║   http://localhost:${PORT}                           ║
  ║                                                   ║
  ║   Features: HTTP fetch, Puppeteer, Credential     ║
  ║   capture, Dynamic form detection                 ║
  ╚═══════════════════════════════════════════════════╝
  `);
});

module.exports = app;
