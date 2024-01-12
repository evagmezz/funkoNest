import * as process from 'process'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async () => ({
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
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
