# Viewing the website

## Active version

> [!NOTE]
> This is where the site will be, however this current version is still in a testing state

[Celeste Skill Rating](https://celesteskillrating.net)

# Running the website locally

## Developing

> [!IMPORTANT]
> This project uses [PostgreSQL](https://www.postgresql.org/), please [import](https://www.postgresql.org/docs/current/backup-dump.html#BACKUP-DUMP-RESTORE) sql/csr_test.sql. Make sure to create a database from template first

> [!NOTE]
> This project uses [SvelteKit](https://svelte.dev/docs/kit/introduction 'SvelteKit Documentation')

Once you've created a project, installed dependencies with `npm install` (or `pnpm install` or `yarn`), set up your Postgres server and suitably edited [example.env](example.env) and [example.wrangler.jsonc](example.wrangler.jsonc) (make sure to remove "example." from the filename), start a development server:

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.
