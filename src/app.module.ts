import { Module } from '@nestjs/common'
import { FunkosModule } from './rest/funkos/funkos.module'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CategoryModule } from './rest/category/category.module'
import * as process from 'process'
import { StorageModule } from './rest/storage/storage.module'
import { ConfigModule } from '@nestjs/config'
import { CacheModule } from '@nestjs/cache-manager'

@Module({
  imports: [
    CacheModule.register(),
    FunkosModule,
    CategoryModule,
    StorageModule,
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: parseInt(process.env.POSTGRES_PORT) || 5432,
      username: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.POSTGRES_DATABASE,
      synchronize: process.env.NODE_ENV === 'dev',
      autoLoadEntities: true,
      entities: [`${__dirname}/**/*.entity{.ts,.js}`],
    }),
  ],
})
export class AppModule {}
