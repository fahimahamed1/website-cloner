const puppeteer = require('puppeteer');
const { PUPPETEER_ARGS, LOGIN_SELECTORS, DEFAULTS } = require('../config/constants');

async function fetchWithPuppeteer(url, waitTime = DEFAULTS.WAIT_TIME) {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: PUPPETEER_ARGS
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8'
    });
    
    // Stealth techniques
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => false });
      Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
      Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
      Object.defineProperty(navigator, 'platform', { get: () => 'Win32' });
      Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => 8 });
      Object.defineProperty(navigator, 'deviceMemory', { get: () => 8 });
      window.chrome = { runtime: {} };
      const originalQuery = window.navigator.permissions.query;
      window.navigator.permissions.query = (parameters) => (
        parameters.name === 'notifications' ?
          Promise.resolve({ state: Notification.permission }) :
          originalQuery(parameters)
      );
    });

    await page.goto(url, { waitUntil: 'networkidle2', timeout: DEFAULTS.TIMEOUT });
    await new Promise(resolve => setTimeout(resolve, waitTime));
    await scrollToBottom(page);
    await waitForLoginSelectors(page);
    const html = await page.content();
    await browser.close();
    return html;
  } catch (error) {
    if (browser) await browser.close();
    throw new Error(`Puppeteer fetch failed: ${error.message}`);
  }
}

async function scrollToBottom(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 100;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;
        if (totalHeight >= scrollHeight || totalHeight > 2000) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
}

async function waitForLoginSelectors(page) {
  for (const selector of LOGIN_SELECTORS) {
    try {
      await page.waitForSelector(selector, { timeout: 3000 });
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (e) { }
  }
}

module.exports = { fetchWithPuppeteer };
