import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import * as process from 'process'
import { ValidationPipe } from '@nestjs/common'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true })
  app.useGlobalPipes(new ValidationPipe())
  await app.listen(process.env.PORT || 3000)
}

bootstrap().then(() => {
  console.log(
    `Aplicación iniciada en el puerto ${process.env.PORT || 3000} con version ${
      process.env.VERSION || '1.0.0'
    }`,
  )
})
