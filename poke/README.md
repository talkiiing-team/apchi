# granat-api

Serverless API

## Как развернуть локально

1. Поднимаем PostgreSQL локально
2. Создаем `.env` со следующим содержимым:
   ```
   DATABASE_URL=
   ```
   И указываем connection string для подключения
3. `npm run dev`

## Инфраструктура

- `api` - точка входа для Vercel
- `app` - приложение на [Fastify](https://www.fastify.io/) со всеми клиентами и
  контейнером с зависимостями
- `libs` - ограниченные контексты для сервисов
  ([подробнее](https://talkiiing.myjetbrains.com/youtrack/articles/LU-A-6/%D0%90%D1%80%D1%85%D0%B8%D1%82%D0%B5%D0%BA%D1%82%D1%83%D1%80%D0%B0))
- `prisma` - всё что относится к ORM [Prisma](https://prisma.io) (модели,
  миграции и т.д.)
- `shared` - [сабмодуль](https://github.com/granat-core/granat-shared) с
  конфигами и экшнами для github actions

## Деплой

API деплоится на Vercel в виде одной единственной Serverless-функции.
