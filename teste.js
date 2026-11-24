const { launchBrowser } = require('./src/browser/puppeteer');

(async () => {
  const browser = await launchBrowser();
  const page = await browser.newPage();

  await page.goto('https://www.google.com');

  console.log('Título:', await page.title());

  await browser.close();
})();