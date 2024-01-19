import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { INestApplication } from '@nestjs/common'

export function swaggerConfig(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('API REST Tienda Funkos 2DAW')
    .setDescription(
      'API REST para la gestión de una tienda de Funkos para el módulo de Desarrollo Web en Entornos Servidor.',
    )
    .setContact(
      'Eva Gómez Uceda',
      'https://github.com/evagmezz',
      'evag.251103@gmail.com',
    )
    .setVersion('1.0.0')
    .addTag('Funkos', 'Operaciones con funkos')
    .addTag('Storage', 'Operaciones con almacenamiento')
    .addTag('Auth', 'Operaciones de autenticación')
    .addBearerAuth()
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api', app, document)
}
