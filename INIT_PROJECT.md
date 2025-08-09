# HƯỚNG DẪN TẠO PROJECT NESTJS CHUYÊN NGHIỆP

## 1. Cài đặt NestJS CLI (Global)
npm install -g @nestjs/cli

## 2. Tạo Project Mới
nest new my-nestjs-app  
cd my-nestjs-app

## 3. Cài Đặt Thư Viện Cốt Lõi
# Database & ORM
npm install @nestjs/typeorm typeorm mysql2

# PostgreSQL
npm install @nestjs/typeorm typeorm pg

# MongoDB
npm install @nestjs/mongoose mongoose

# Configuration
npm install @nestjs/config

# Authentication & Security
npm install @nestjs/jwt @nestjs/passport passport passport-jwt bcryptjs

# API Documentation
npm install @nestjs/swagger swagger-ui-express

# Validation
npm install class-validator class-transformer

# Rate Limiting
npm install @nestjs/throttler

# Caching
npm install @nestjs/cache-manager cache-manager  
npm install redis cache-manager-redis-store

# File Upload
npm install @nestjs/platform-express multer

# Email
npm install @nestjs-modules/mailer nodemailer

# Scheduling
npm install @nestjs/schedule

# Testing
npm install @nestjs/testing

## 4. Cài Đặt Dev Dependencies
npm install -D @types/passport-jwt @types/bcryptjs @types/multer @types/nodemailer  
npm install -D supertest @types/supertest  
npm install -D eslint prettier eslint-config-prettier eslint-plugin-prettier

## 5. Cấu Trúc Thư Mục
mkdir src/common/{decorators,dto,entities,enums,exceptions,filters,guards,interceptors,interfaces,middleware,pipes,utils}  
mkdir src/config  
mkdir src/database/{entities,migrations,seeds,subscribers}  
mkdir -p src/modules/{auth/{controllers,dto,services,strategies,tests},users/{controllers,dto,entities,repositories,services,tests},products/{controllers,dto,entities,services,tests}}  
mkdir src/shared/{cache,database,logger}  
mkdir test/{e2e,helpers}

## 6. File Cấu Hình
touch .env .env.example .env.test .env.production  
touch docker-compose.yml docker-compose.prod.yml Dockerfile .dockerignore .gitignore

## 7. Lệnh Nest CLI
nest g resource modules/users --no-spec  
nest g resource modules/products --no-spec  
nest g resource modules/auth --no-spec  
nest g controller modules/users/controllers/users --no-spec  
nest g service modules/users/services/users --no-spec  
nest g module modules/users --no-spec  
nest g guard common/guards/jwt-auth --no-spec  
nest g interceptor common/interceptors/response --no-spec  
nest g filter common/filters/http-exception --no-spec  
nest g pipe common/pipes/validation --no-spec  
nest g middleware common/middleware/logger --no-spec

## 8. Lệnh Database (TypeORM)
npx typeorm migration:create src/database/migrations/CreateUsersTable  
npx typeorm-ts-node-commonjs migration:generate src/database/migrations/Initial -d src/database/data-source.ts  
npx typeorm-ts-node-commonjs migration:run -d src/database/data-source.ts  
npx typeorm-ts-node-commonjs migration:revert -d src/database/data-source.ts

## 9. Docker Commands
docker-compose up -d  
docker-compose up -d mysql redis  
docker-compose logs -f  
docker-compose down  
docker-compose up --build

## 10. Development Commands
npm run start:dev  
npm run build  
npm run start:prod  
npm run test  
npm run test:watch  
npm run test:cov  
npm run test:e2e  
npm run format  
npm run lint

## 11. Advanced Installations
npm install @nestjs/graphql @nestjs/apollo graphql apollo-server-express  
npm install @nestjs/microservices  
npm install @nestjs/websockets @nestjs/platform-socket.io  
npm install @nestjs/event-emitter  
npm install @nestjs/bull bull  
npm install compression && npm install -D @types/compression  
npm install cors && npm install -D @types/cors  
npm install helmet  
npm install express-rate-limit && npm install -D @types/express-rate-limit  
npm install winston nest-winston  
npm install @nestjs/terminus  
npm install @nestjs/prometheus prom-client

## 12. Quick Setup Script (Windows)
@echo off  
echo Setting up NestJS Project...  
npm install -g @nestjs/cli  
nest new %1  
cd %1  
npm install @nestjs/typeorm typeorm mysql2 @nestjs/config @nestjs/jwt @nestjs/passport passport passport-jwt @nestjs/swagger swagger-ui-express class-validator class-transformer bcryptjs @nestjs/throttler @nestjs/cache-manager cache-manager redis cache-manager-redis-store  
npm install -D @types/passport-jwt @types/bcryptjs @types/redis supertest @types/supertest  
mkdir src\common\decorators src\common\dto src\common\entities src\common\enums src\common\filters src\common\guards src\common\interceptors src\common\pipes src\config src\database\entities src\database\migrations src\modules\auth\controllers src\modules\auth\dto src\modules\auth\services src\modules\users\controllers src\modules\users\dto src\modules\users\entities src\modules\users\services src\shared  
copy .env .env.example  
echo Setup complete!

## 13. Production Deployment
npm run build  
docker build -t my-nestjs-app .  
docker-compose -f docker-compose.prod.yml up -d  
curl http://localhost:3000/api/v1/health  
docker-compose logs -f app

## 14. Monitoring & Debugging
npm run start:debug  
node --inspect-brk dist/main.js  
node --inspect --max-old-space-size=4096 dist/main.js  
npm install clinic  
npx clinic doctor -- node dist/main.js  
