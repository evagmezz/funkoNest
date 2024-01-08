import { Module } from '@nestjs/common'
import { FunkosModule } from './funkos/funkos.module'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CategoryModule } from './category/category.module'
import { CategoryMapper } from './category/mapper/category-mapper'
import { FunkoMapper } from './funkos/mapper/funko-mapper'

@Module({
  imports: [
    FunkosModule,
    CategoryModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'admin',
      password: 'admin1234',
      database: 'funkos',
      synchronize: true,
      autoLoadEntities: true,
      entities: [`${__dirname}/**/*.entity{.ts,.js}`],
    }),
    CategoryModule,
  ],
  providers: [CategoryMapper, FunkoMapper],
})
export class AppModule {}
