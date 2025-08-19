import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { UsersModule } from '@/modules/users/users.module';
import { ProductsModule } from '@/modules/products/products.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { PostModule } from '@/modules/post/post.module';
import { PrismaModule } from '@/infrastructure/database/prisma.module';
import { ImageModule } from '@/common/image/image.module';
import { RedisModule } from '@/infrastructure/cache/redis/redis.module';
import { MetaModule } from '@/infrastructure/meta';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    UsersModule,
    ProductsModule,
    AuthModule,
    PostModule,
    PrismaModule,
    ImageModule,
    RedisModule,
    MetaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
