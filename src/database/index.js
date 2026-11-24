const { openDatabase, initSchema, closeDatabase, DEFAULT_DB_PATH } = require('./connection');
const { newsExists, insertNews, getLatestNews, countNews } = require('./news-repository');

module.exports = {
  openDatabase,
  initSchema,
  closeDatabase,
  DEFAULT_DB_PATH,
  newsExists,
  insertNews,
  getLatestNews,
  countNews,
};