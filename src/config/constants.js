const BROWSER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Accept-Encoding': 'gzip, deflate, br',
  'Connection': 'keep-alive',
  'Upgrade-Insecure-Requests': '1',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'none',
  'Sec-Fetch-User': '?1',
  'Cache-Control': 'max-age=0'
};

const PUPPETEER_ARGS = [
  '--no-sandbox',
  '--disable-setuid-sandbox',
  '--disable-dev-shm-usage',
  '--disable-accelerated-2d-canvas',
  '--no-first-run',
  '--no-zygote',
  '--disable-gpu',
  '--disable-blink-features=AutomationControlled',
  '--disable-web-security',
  '--disable-features=IsolateOrigins,site-per-process'
];

const LOGIN_SELECTORS = [
  'input[type="password"]',
  'input[name*="login"]',
  'input[name*="email"]',
  'input[name*="user"]',
  'input[name*="username"]',
  'input[name*="session"]',
  'input[autocomplete="username"]',
  'input[autocomplete="email"]',
  'form[action*="login"]',
  'form[action*="signin"]',
  'form[action*="auth"]',
  '[data-testid*="login"]',
  '[data-testid*="username"]',
  '[class*="login"]',
  '[class*="signin"]',
  '#login-form',
  '.login-form',
  '.signin-form'
];

const DEFAULTS = {
  PORT: 3000,
  WAIT_TIME: 5000,
  ACTION: '/login',
  TIMEOUT: 45000
};

module.exports = { BROWSER_HEADERS, PUPPETEER_ARGS, LOGIN_SELECTORS, DEFAULTS };
