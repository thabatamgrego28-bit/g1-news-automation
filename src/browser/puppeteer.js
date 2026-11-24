const fs = require('node:fs');
const puppeteer = require('puppeteer');

const BASE_ARGS = [
  '--no-sandbox',
  '--disable-setuid-sandbox',
  '--disable-dev-shm-usage',
  '--disable-crash-reporter',
  '--disable-breakpad',
  '--disable-gpu',
];

function isWsl() {
  try {
    return /microsoft|wsl/i.test(fs.readFileSync('/proc/version', 'utf8'));
  } catch {
    return false;
  }
}

function resolveHeadless(optionHeadless) {
  if (optionHeadless !== undefined) return Boolean(optionHeadless);

  const raw = process.env.HEADLESS;
  if (raw === undefined) return true;

  const value = String(raw).trim().toLowerCase();
  if (['false', '0', 'no', 'off', 'headed', 'visual'].includes(value)) return false;
  if (['true', '1', 'yes', 'on', 'headless'].includes(value)) return true;
  // Qualquer valor não reconhecido mantém o padrão (headless).
  return true;
}

async function launchBrowser(options = {}) {
  const { headless: optionHeadless, env: optionEnv, ...rest } = options;
  const headless = resolveHeadless(optionHeadless);

  // Em ambientes WSL, o Chrome visual precisa de um display (WSLg fornece :0).
  const env = { ...process.env, ...(optionEnv || {}) };
  if (!headless && isWsl() && !env.DISPLAY) {
    env.DISPLAY = ':0';
  }

  return puppeteer.launch({
    headless,
    args: BASE_ARGS,
    env,
    ...rest,
    headless,
  });
}

module.exports = { launchBrowser, resolveHeadless, isWsl };