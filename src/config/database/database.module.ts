import * as process from 'process'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { MongooseModule } from '@nestjs/mongoose'

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: () => ({
        type: 'postgres',
        host: process.env.POSTGRES_HOST || 'localhost',
        port: parseInt(process.env.POSTGRES_PORT) || 5432,
        username: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.POSTGRES_DATABASE,
        autoLoadEntities: true,
        entities: [`${__dirname}/**/*.entity{.ts,.js}`],
        synchronize: true,
      }),
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async () => ({
        uri: `mongodb://${process.env.DATABASE_USER}:${
          process.env.DATABASE_PASSWORD
        }@${process.env.MONGO_HOST}:${process.env.MONGO_PORT || 27017}/${
          process.env.MONGO_DATABASE
        }`,
      }),
    }),
  ],
  providers: [],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
