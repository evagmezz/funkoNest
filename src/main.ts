import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import * as process from 'process'
import { ValidationPipe } from '@nestjs/common'
import { getSSLOptions } from './config/ssl/ssl.config'
import { swaggerConfig } from './config/swagger/swagger.config'
import * as dotenv from 'dotenv'

dotenv.config()
async function bootstrap() {
  if (process.env.NODE_ENV === 'dev') {
    console.log('🛠️ Iniciando Nestjs Modo desarrollo 🛠️')
  } else {
    console.log('🚗 Iniciando Nestjs Modo producción 🚗')
  }
  const httpsOptions = getSSLOptions()
  const app = await NestFactory.create(AppModule, { httpsOptions })
  if (process.env.NODE_ENV === 'dev') {
    swaggerConfig(app)
  }
  app.useGlobalPipes(new ValidationPipe())
  await app.listen(process.env.PORT || 3000)
}

bootstrap().then(() => {
  console.log(
    `Aplicación iniciada en el puerto ${process.env.PORT || 3000} 🚀
    }`,
  )
})
