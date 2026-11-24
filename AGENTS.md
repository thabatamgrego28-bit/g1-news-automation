# AGENTS.md

Guia para agentes de IA (OpenCode) trabalhando neste repositório.

## Visão geral

Projeto Node.js (CommonJS) de automação que coleta a notícia mais recente do portal G1 (g1.globo.com) usando Puppeteer. Executa em modo headless e imprime título, data de publicação e link da notícia no console.

- Entrada: `src/index.js`
- Saída: console (stdout/stderr)
- Runtime: Node.js (sem bundler, sem transpilação)

## Comandos

```bash
# Instalar dependências
npm install

# Executar a coleta
npm start
# equivalente a: node src/index.js
```

Não há testes, lint ou build configurados. Valide manualmente executando `npm start` (requer acesso à internet e ao site do G1).

## Estrutura

```
src/
  index.js                     # Orquestração: lança browser, chama coletor, imprime resumo
  browser/
    puppeteer.js               # launchBrowser(options) — configuração do Puppeteer (headless, flags)
  services/
    news-collector.js          # collectLatestNews(page, options) — coleta, formatação, persistência
    screenshot.js              # captureScreenshot(page, options) — captura de screenshots
  sources/
    g1/
      index.js                 # collectNews(page, options), G1_URL — scraping do G1
  database/
    connection.js              # openDatabase/initSchema/closeDatabase — conexão SQLite
    news-repository.js         # newsExists/insertNews/getLatestNews/countNews
    index.js                   # Barrel do módulo de banco
data/                          # Banco de dados local (news.db) — ignorado no Git
screenshots/                   # Capturas de tela — ignoradas no Git
```

Fluxo: `index.js` → `launchBrowser()` → `collectLatestNews(page)` → `collectNews(page)` (G1, com screenshots) → formatação da data → persistência SQLite → retorno.

## Convenções de código

- CommonJS (`require`/`module.exports`); `"type": "commonjs"` no `package.json`.
- Idioma do código e mensagens: português (pt-BR). Mantenha essa convenção em logs, comentários e documentação.
- Indentação: 2 espaços.
- Sem TypeScript; sem linter configurado — siga o estilo existente.
- Erros são capturados e registrados com `console.error`, sem lançar em fluxos de coleta; o processo sai com código 1 apenas em falha não tratada em `main()`.

## Pontos de atenção para alterações

- O scraping depende da estrutura HTML do G1 (seletores `.feed-post`, `a.feed-post-link`, `meta[property="article:published_time"]`, JSON-LD). Alterações no site podem quebrar a coleta — teste com `npm start`.
- `launchBrowser` aceita `options` mescladas após os args padrão; não remova as flags `--no-sandbox`/`--disable-setuid-sandbox` (ambiente pode não ter sandbox).
- Timeouts de navegação: 60s (goto), 20s (waitForSelector do feed), 10s (h1). Ajuste com cuidado.
- Datas são formatadas para `pt-BR` no fuso `America/Sao_Paulo` via `Intl.DateTimeFormat`. Mantenha esse comportamento.
- `collectNews` retorna `{ items, screenshots }` (atualmente 1 item em `items` ou `[]`); `collectLatestNews` consome apenas o primeiro item (`items[0]`).
- Screenshots são salvos em `screenshots/` com nomes contendo data/horário da captura.
- Banco local em `data/news.db`; URL é identificador único (evita duplicatas).

## Dependências

- `puppeteer` ^25.18.1 — única dependência de produção.
- SQLite via módulo nativo `node:sqlite` (Node.js 22.5+) — sem dependência adicional.

## Escopo sugerido para agentes

- Ao adicionar novas fontes, crie um módulo em `src/sources/<fonte>/index.js` expondo `collectNews(page)` e registre-o em `src/services/news-collector.js` (ou crie um coletor dedicado).
- Mantenha `launchBrowser` como ponto único de criação do browser.
- Evite adicionar dependências sem necessidade; prefira APIs nativas do Node.
- Atualize este arquivo ao mudar estrutura, comandos ou convenções.
