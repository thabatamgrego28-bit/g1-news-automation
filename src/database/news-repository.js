function newsExists(db, url) {
  const row = db.prepare('SELECT 1 FROM news WHERE url = ?').get(url);
  return Boolean(row);
}

function insertNews(db, item) {
  if (!item || !item.url) return { inserted: false };

  if (newsExists(db, item.url)) {
    return { inserted: false };
  }

  const stmt = db.prepare(`
    INSERT INTO news (title, publication_date, url, collected_at)
    VALUES (?, ?, ?, ?)
  `);
  const result = stmt.run(
    item.title || '',
    item.publicationDate || null,
    item.url,
    item.collectedAt || new Date().toISOString(),
  );
  return { inserted: result.changes > 0, id: result.lastInsertRowid };
}

function getLatestNews(db, limit = 5) {
  const rows = db.prepare(`
    SELECT id, title, publication_date AS publicationDate, url, collected_at AS collectedAt
    FROM news
    ORDER BY collected_at DESC, id DESC
    LIMIT ?
  `).all(limit);
  return rows;
}

function countNews(db) {
  const row = db.prepare('SELECT COUNT(*) AS total FROM news').get();
  return row ? row.total : 0;
}

module.exports = { newsExists, insertNews, getLatestNews, countNews };