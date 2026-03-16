const fetch = require('node-fetch');
const { BROWSER_HEADERS } = require('../config/constants');

async function fetchWebsite(url) {
  const response = await fetch(url, {
    headers: BROWSER_HEADERS,
    redirect: 'follow',
    timeout: 30000
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
  }
  const html = await response.text();
  if (!html || html.length < 100) {
    throw new Error('Received empty or invalid response');
  }
  return html;
}

async function isAccessible(url) {
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      headers: BROWSER_HEADERS,
      timeout: 10000
    });
    return response.ok;
  } catch {
    return false;
  }
}

module.exports = { fetchWebsite, isAccessible };
