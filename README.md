## What is this?

Waste Bank API using Hono Web application 

## Requirements

- bun
- typescript

## How to start

- Make sure you already have bun installed.
- Install dependency manager use command :

  `bun install`
- Run server :

  `bun run dev## What is this?

  HR ADMS (Human Resource Automatic Data Master Server)

  ## Requirements

  - php >= 8.2
  - composer
  - node 20
  - [pnpm](https://pnpm.io/) (you can use npm or other if you like)
  - bootstrap 4.6 (AdminLTE 3)

  ## How to start

  - Make sure you already have composer installed.
  - Install dependency manager use command :

    `composer install`
  - Install package manager for javascript asset :

    `pnpm install`
  - Run artisan command to create symbolink :

    `php artisan storage:link`

  ## Development

  - Run server :

    ```
    php artisan serve
    pnpm dev
    php artisan queue:work
    ```
  - Install debug bar for development :
  - composer require barryvdh/laravel-debugbar --dev

  ## Production

  - Create symbolink (run this only once) :

    `php artisan storage:link`
  - Generate new key and clear :

    `php artisan key:generate`
  - Install package with no dev :

    `composer install --optimize-autoloader --no-dev`
  - Build asset javascript :

    `pnpm build`
  - Run this to clear cache :

    ```
    php artisan config:clear
    php artisan event:clear
    php artisan route:clear
    php artisan view:clear
    php artisan optimize:clear
    php artisan data:cache-structures
    ```
  - Run these to cache :

    ```
    php artisan config:cache
    php artisan event:cache
    php artisan route:cache
    php artisan view:cache
    ```
  - When you pull new change from git rebuild the asset javascript pages :

  ## Cheatsheet

  - Run server with port

    `php artisan serve --port=8000`
  - Easy way to create model, migration, controller, request

    `php artisan make:model Role -mscr`

    or

    `php artisan make:model Role --migration --seed --controller --resource`
  - Generate model for \_ide_helper

    `php artisan ide-helper:models`
  - Seed specific seeder (use this when you add new access in config/access.php file)

    `php artisan db:seed --class=RoleAccessSeeder`
  - Clear database and migrate with seed (ONLY USE THIS IN DEVELOPMENT ENVIRONMENT/STAGE)

    `php artisan migrate:fresh --seed`
  - Migrate specific table / migration :

    `php artisan migrate:refresh --path=/database/migrations/0001_01_01_000003_create_jobs_table.php`
  - Run specific schedule :

    `php artisan schedule:test`

    Select index of list (0,1,2 etc) then press enter`
