const { launchBrowser } = require('./browser/puppeteer');
const { collectLatestNews } = require('./services/news-collector');

async function main() {
  let browser;
  try {
    browser = await launchBrowser();
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(60000);
    const result = await collectLatestNews(page);

    if (result.latest) {
      console.log(`Título: ${result.latest.title}`);
      console.log(`Data de publicação: ${result.latest.publicationDate || 'indisponível'}`);
      console.log(`Link: ${result.latest.url}`);
      console.log(`Status: ${result.inserted ? 'nova notícia armazenada' : 'notícia já existente (sem duplicação)'}`);
    } else {
      console.log('Não foi possível identificar a notícia mais recente no G1.');
    }

    console.log(`Total de notícias armazenadas: ${result.totalStored}`);
    if (result.screenshots && result.screenshots.length) {
      console.log('Screenshots salvos:');
      for (const file of result.screenshots) console.log(`  - ${file}`);
    }

    if (result.recent && result.recent.length) {
      console.log('Últimas notícias armazenadas:');
      for (const news of result.recent) {
        console.log(`  - ${news.title} (${news.url})`);
      }
    }
  } finally {
    if (browser) await browser.close();
  }
}

main().catch((error) => {
  console.error('Falha na coleta do G1:', error.message);
  process.exitCode = 1;
});