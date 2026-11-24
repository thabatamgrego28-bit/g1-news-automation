# Automação de notícias do G1

Projeto Node.js que automatiza a coleta da notícia mais recente do portal G1
(g1.globo.com) utilizando Puppeteer em modo headless. As notícias coletadas são
armazenadas em um banco de dados SQLite local (sem duplicatas) e screenshots da
página acessada são salvos para posterior consulta.

## Objetivo

Automatizar a coleta de notícias do G1, persistindo o histórico localmente e
registrando evidências visuais (screenshots) de cada execução.

## Tecnologias utilizadas

- Node.js (CommonJS, sem bundler/transpilação)
- Puppeteer (navegação headless e screenshots)
- SQLite via módulo nativo `node:sqlite` (sem dependências adicionais)

## Pré-requisitos

- Node.js 22.5+ (recomendado 26+) — necessário para o módulo nativo `node:sqlite`
- Acesso à internet (o G1 é acessado em tempo de execução)

## Instalação

```bash
npm install
```

## Execução

Modo headless (padrão, sem exibir o navegador):

```bash
npm start
# equivalente a: node src/index.js
```

Modo visual (headed, abre o navegador Chrome durante a automação):

```bash
HEADLESS=false npm start
# equivalente a: HEADLESS=false node src/index.js
# ou: npm run start:visual
```

A variável de ambiente `HEADLESS` controla o modo de execução:

- `HEADLESS=true` (ou não definida): execução em segundo plano (padrão).
- `HEADLESS=false`: abre o navegador visualmente.

No Ubuntu via WSL, o modo visual utiliza o display do WSLg (`DISPLAY=:0`)
automaticamente quando disponível; caso a variável `DISPLAY` não esteja definida,
o projeto a configura para `:0`. Certifique-se de estar em um WSL2 com WSLg
habilitado (Windows 11 ou Windows 10 atualizado) para que a janela do Chrome
seja exibida.

Ao final da execução, o terminal exibe um resumo com título, data de publicação,
link, status de armazenamento, total de notícias armazenadas, screenshots salvos
e as últimas notícias do histórico.

## Armazenamento das notícias

- Banco local: `data/news.db` (SQLite).
- Tabela `news` com colunas: `id`, `title`, `publication_date`, `url` (único),
  `collected_at`.
- O banco e a tabela são criados automaticamente na primeira execução.
- Antes de inserir, verifica-se se a URL já existe; notícias duplicadas não são
  inseridas, mantendo um histórico único.
- É possível consultar as últimas notícias armazenadas (exibidas no resumo da
  execução).

## Screenshots

- Salvos em `screenshots/`.
- Nomes de arquivo identificam data e horário da captura, por exemplo:
  `g1-noticia-2026-11-24_09-30-32-154.png`.
- Capturas da home do G1 e da página da notícia são geradas a cada execução.

## Estrutura do projeto

```
src/
  index.js                     # Orquestração
  browser/
    puppeteer.js               # launchBrowser(options)
  services/
    news-collector.js          # Coleta + formatação + persistência
    screenshot.js              # Captura de screenshots
  sources/
    g1/
      index.js                 # Scraping do G1
  database/
    connection.js              # Conexão e schema SQLite
    news-repository.js         # Operações de persistência
    index.js                   # Barrel do módulo
data/                          # Banco de dados local (ignorado no Git)
screenshots/                   # Capturas de tela (ignoradas no Git)
```

## Git

O repositório não envia `node_modules`, banco de dados local, screenshots
gerados, arquivos temporários nem informações sensíveis (ver `.gitignore`).