const G1_URL = 'https://g1.globo.com/';
const { captureScreenshot } = require('../../services/screenshot');

async function collectNews(page, options = {}) {
  const capture = options.captureScreenshots !== false;
  const screenshots = [];

  try {
    await page.goto(G1_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForSelector('a.feed-post-link, .feed-post a[href]', { timeout: 20000 }).catch(() => {});

    if (capture) {
      try {
        screenshots.push(await captureScreenshot(page, { label: 'g1-home', dir: options.screenshotsDir }));
      } catch (error) {
        console.error('Não foi possível capturar screenshot da home do G1:', error.message);
      }
    }

    const article = await page.evaluate(() => {
      const isArticleUrl = (href) => {
        try {
          const url = new URL(href, location.href);
          return url.hostname === 'g1.globo.com' && url.pathname.split('/').filter(Boolean).length >= 3;
        } catch {
          return false;
        }
      };
      const isVisible = (element) => Boolean(element.getClientRects().length);
      const cards = Array.from(document.querySelectorAll('.feed-post, article'));

      // A home do G1 apresenta o feed em ordem cronológica; limitar a busca aos
      // cards evita selecionar links de navegação ou chamadas fora do feed.
      for (const card of cards) {
        if (!isVisible(card)) continue;
        const candidates = Array.from(card.querySelectorAll('a.feed-post-link, a[href]'));
        const link = candidates.find((candidate) => {
          const text = (candidate.innerText || candidate.getAttribute('title') || '').trim();
          return text && isArticleUrl(candidate.href);
        });
        if (!link) continue;
        return {
          title: (link.innerText || link.getAttribute('title') || '').trim().replace(/\s+/g, ' '),
          url: link.href,
        };
      }
      return null;
    });

    if (!article) {
      return { items: [], screenshots };
    }

    let publicationDate = null;
    try {
      await page.goto(article.url, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForSelector('h1', { timeout: 10000 }).catch(() => {});

      if (capture) {
        try {
          screenshots.push(await captureScreenshot(page, { label: 'g1-noticia', dir: options.screenshotsDir }));
        } catch (error) {
          console.error('Não foi possível capturar screenshot da notícia do G1:', error.message);
        }
      }
      const articleData = await page.evaluate(() => {
        const selectors = [
          'meta[property="article:published_time"]',
          'meta[itemprop="datePublished"]',
          'meta[name="date"]',
          'time[datetime]',
        ];
        for (const selector of selectors) {
          const value = document.querySelector(selector)?.getAttribute('content')
            || document.querySelector(selector)?.getAttribute('datetime');
          if (value?.trim()) return { title: document.querySelector('h1')?.innerText?.trim(), date: value.trim() };
        }

        const readDatePublished = (value) => {
          if (Array.isArray(value)) {
            for (const entry of value) {
              const date = readDatePublished(entry);
              if (date) return date;
            }
          } else if (value && typeof value === 'object') {
            if (typeof value.datePublished === 'string' && value.datePublished.trim()) return value.datePublished.trim();
            for (const entry of Object.values(value)) {
              const date = readDatePublished(entry);
              if (date) return date;
            }
          }
          return null;
        };
        for (const script of document.querySelectorAll('script[type="application/ld+json"]')) {
          try {
            const date = readDatePublished(JSON.parse(script.textContent));
            if (date) return { title: document.querySelector('h1')?.innerText?.trim(), date };
          } catch { /* JSON-LD inválido; tenta o próximo bloco. */ }
        }
        return { title: document.querySelector('h1')?.innerText?.trim(), date: null };
      });
      article.title = articleData.title || article.title;
      publicationDate = articleData.date;
    } catch (error) {
      console.error('Não foi possível carregar ou extrair a página da notícia:', error.message);
    }

    return { items: [{ ...article, publicationDate }], screenshots };
  } catch (error) {
    console.error('Não foi possível carregar ou extrair o feed do G1:', error.message);
    return { items: [], screenshots };
  }
}

module.exports = { collectNews, G1_URL };
