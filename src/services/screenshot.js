const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..', '..');
const DEFAULT_SCREENSHOTS_DIR = path.join(PROJECT_ROOT, 'screenshots');

function ensureScreenshotsDir(dir = DEFAULT_SCREENSHOTS_DIR) {
  const resolved = path.resolve(dir);
  fs.mkdirSync(resolved, { recursive: true });
  return resolved;
}

function buildTimestamp() {
  const now = new Date();
  const pad = (value) => String(value).padStart(2, '0');
  const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const time = `${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
  const ms = String(now.getMilliseconds()).padStart(3, '0');
  return `${date}_${time}-${ms}`;
}

function sanitizeLabel(label) {
  return String(label || 'captura')
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'captura';
}

async function captureScreenshot(page, options = {}) {
  const dir = ensureScreenshotsDir(options.dir || DEFAULT_SCREENSHOTS_DIR);
  const label = sanitizeLabel(options.label);
  let filePath = path.join(dir, `${label}-${buildTimestamp()}.png`);

  // Evita sobrescrever um arquivo existente (colisão de nome).
  let counter = 1;
  while (fs.existsSync(filePath)) {
    filePath = path.join(dir, `${label}-${buildTimestamp()}-${counter}.png`);
    counter += 1;
  }

  await page.screenshot({ path: filePath, fullPage: options.fullPage === true });
  return filePath;
}

module.exports = {
  DEFAULT_SCREENSHOTS_DIR,
  ensureScreenshotsDir,
  captureScreenshot,
};