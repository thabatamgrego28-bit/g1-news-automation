const { collectNews } = require('../sources/g1');
const {
  openDatabase,
  initSchema,
  closeDatabase,
  insertNews,
  getLatestNews,
  countNews,
  DEFAULT_DB_PATH,
} = require('../database');

function formatPublicationDate(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);
}

async function collectLatestNews(page, options = {}) {
  const collected = await collectNews(page, options);
  const items = (collected && collected.items) || [];
  const screenshots = (collected && collected.screenshots) || [];
  const item = items[0] || null;

  const dbPath = options.dbPath || DEFAULT_DB_PATH;
  let inserted = false;
  let recent = [];
  let totalStored = 0;

  let db;
  try {
    db = openDatabase(dbPath);
    initSchema(db);

    const collectedAt = new Date().toISOString();
    for (const newsItem of items) {
      const result = insertNews(db, {
        title: newsItem.title,
        publicationDate: newsItem.publicationDate,
        url: newsItem.url,
        collectedAt,
      });
      if (newsItem === item) inserted = result.inserted;
    }

    recent = getLatestNews(db, options.recentLimit || 5);
    totalStored = countNews(db);
  } catch (error) {
    console.error('Não foi possível armazenar as notícias no SQLite:', error.message);
  } finally {
    closeDatabase(db);
  }

  return {
    count: item ? 1 : 0,
    latest: item ? {
      ...item,
      publicationDate: formatPublicationDate(item.publicationDate),
    } : null,
    inserted,
    screenshots,
    recent,
    totalStored,
  };
}

module.exports = { collectLatestNews, formatPublicationDate };