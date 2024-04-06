# Migrate

> ## Migrate is a process to make version control for database schema
>
> ### To use migrate right way. we need follow some rules:
>
> - Follow this doc [here](https://sequelize.org/docs/v7/cli/#writing-a-migration)
> - Make sure every process that change database schema must through migrate
> - Shouldn't use migrate undo. Because migrate undo cause hard to keep track version of database schema
> - Should check if exists when add or delete new table, column to reduce error when run migrate
> - Should naming migration file follow pattern: `<action>_<column>_to_<table>`. Ex: `create_isUse_to_UsersNew`
>
> ### How to create a migrate in development need follow steps below:
>
> 1. In terminal type: `npx sequelize-cli migration:generate --name <name of migration>`
> 2. Write action to change database schema in file created by command above and save file.
> 3. Also change models file for match with migrate.
> 4. In terminal type: `npm run migrate:up`.
>
> ### How to deploy migrate need follow steps below:
>
> 1. Pull latest code from deploy branch
> 2. Make sure right database info in file `.env.prod`
> 3. In terminal type: `npm install`
> 4. In terminal type: `npm run prod:migrate:up`
> 5. In terminal type: `npm run build`
> 6. In terminal type: `npm run start`
