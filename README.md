# Viewing the website

## Active version

> [!NOTE]
> This version should always be online. If it's not, please try again later or a testing version before contacting Zelda on discord

http://185.230.217.233:3000/

## Testing version

http://185.230.217.233:5173/ or http://185.230.217.233:5174/

# Running the website locally

## Developing

> [!IMPORTANT]
> This project uses [PostgreSQL](https://www.postgresql.org/), please [import](https://www.postgresql.org/docs/current/backup-dump.html#BACKUP-DUMP-RESTORE) sql/csr_test.sql. Make sure to create a database from template first

> [!NOTE]
> This project uses [SvelteKit](https://svelte.dev/docs/kit/introduction 'SvelteKit Documentation')

Once you've created a project, installed dependencies with `npm install` (or `pnpm install` or `yarn`), set up your Postgres server and suitably edited [example.env] and [src/lib/database/example.db.js] (make sure to remove "example." from the filename), start a development server:

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

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.
