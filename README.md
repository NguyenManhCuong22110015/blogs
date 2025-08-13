<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

# Structure API

A modern NestJS API with Prisma ORM, PostgreSQL database, and comprehensive CRUD operations.

## Features

- 🚀 **NestJS 11** - Modern Node.js framework
- 🗄️ **Prisma ORM** - Type-safe database access
- 🐘 **PostgreSQL** - Robust relational database
- 📚 **Swagger/OpenAPI** - Interactive API documentation
- 🔐 **JWT Authentication** - Secure user authentication
- ✅ **Validation** - Request/response validation
- 🎯 **TypeScript** - Full type safety

## API Endpoints

### Users
- `POST /users` - Create user
- `GET /users` - Get all users
- `GET /users/:id` - Get user by ID
- `PATCH /users/:id` - Update user
- `DELETE /users/:id` - Delete user

### Posts
- `POST /post` - Create post
- `GET /post` - Get all posts (paginated)
- `GET /post/:id` - Get post by ID
- `PATCH /post/:id` - Update post
- `DELETE /post/:id` - Delete post

### Swagger Documentation
- Visit `/api` for interactive API documentation

## Quick Start

### Local Development

1. **Install dependencies**
```bash
npm install
```

2. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your database URL
```

3. **Run database migrations**
```bash
npx prisma migrate dev
```

4. **Seed database (optional)**
```bash
npm run prisma:seed
```

5. **Start development server**
```bash
npm run start:dev
```

### Production Build

```bash
npm run build
npm run start:prod
```

## Heroku Deployment

### Option 1: Heroku CLI

1. **Install Heroku CLI**
```bash
npm install -g heroku
```

2. **Login to Heroku**
```bash
heroku login
```

3. **Create Heroku app**
```bash
heroku create your-app-name
```

4. **Add PostgreSQL addon**
```bash
heroku addons:create heroku-postgresql:mini
```

5. **Set environment variables**
```bash
heroku config:set NODE_ENV=production
heroku config:set DATABASE_URL=$(heroku config:get DATABASE_URL)
```

6. **Deploy**
```bash
git add .
git commit -m "Deploy to Heroku"
git push heroku main
```

7. **Run migrations**
```bash
heroku run npx prisma migrate deploy
```

### Option 2: Heroku Dashboard

1. Connect your GitHub repository
2. Enable automatic deploys
3. Add PostgreSQL addon
4. Set environment variables in dashboard
5. Deploy manually or enable auto-deploy

## Environment Variables

```env
# Database
DATABASE_URL="postgresql://username:password@host:port/database"

# App
NODE_ENV="development"
PORT="5000"

# Frontend (for CORS)
FRONTEND_URL="https://yourdomain.com"
```

## Database Schema

### User Model
- `id` - Unique identifier (CUID)
- `email` - User email (unique)
- `username` - Optional username (unique)
- `full_name` - User's full name
- `avatar` - Profile picture URL
- `created_at` - Account creation timestamp
- `updated_at` - Last update timestamp

### Post Model
- `id` - Unique identifier (UUID)
- `title` - Post title
- `slug` - URL-friendly identifier (unique)
- `content` - Post content (markdown)
- `summary` - Post summary
- `thumbnail_url` - Featured image URL
- `status` - Publication status (DRAFT/PUBLISHED/ARCHIVED)
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp
- `published_at` - Publication timestamp

## Development

### Available Scripts

- `npm run build` - Build the application
- `npm run start` - Start the application
- `npm run start:dev` - Start in development mode with hot reload
- `npm run start:prod` - Start in production mode
- `npm run lint` - Run ESLint
- `npm run test` - Run tests
- `npm run prisma:seed` - Seed the database

### Code Style

This project uses:
- **ESLint** for code linting
- **Prettier** for code formatting
- **TypeScript** for type safety

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
