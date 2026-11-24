const puppeteer = require('puppeteer');

async function launchBrowser(options = {}) {
  return puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-crash-reporter',
      '--disable-breakpad',
    ],
    ...options,
  });
}

module.exports = { launchBrowser };
