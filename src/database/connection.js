const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const PROJECT_ROOT = path.resolve(__dirname, '..', '..');
const DEFAULT_DB_PATH = path.join(PROJECT_ROOT, 'data', 'news.db');

function openDatabase(dbPath = DEFAULT_DB_PATH) {
  const resolvedPath = path.resolve(dbPath);
  fs.mkdirSync(path.dirname(resolvedPath), { recursive: true });
  const db = new DatabaseSync(resolvedPath);
  db.exec('PRAGMA journal_mode = WAL;');
  return db;
}

function initSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS news (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      publication_date TEXT,
      url TEXT NOT NULL UNIQUE,
      collected_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_news_collected_at ON news(collected_at);
  `);
}

function closeDatabase(db) {
  if (db) {
    try { db.close(); } catch (error) { /* ignora erros ao fechar */ }
  }
}

module.exports = {
  PROJECT_ROOT,
  DEFAULT_DB_PATH,
  openDatabase,
  initSchema,
  closeDatabase,
};