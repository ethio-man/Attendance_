import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  app.enableCors({
    origin: ['http://localhost:5173'],
    credentials: true,
  });

  const PORT = process.env.PORT || 8080;

  await app.listen(PORT, '0.0.0.0');

  console.log(`Server running on port ${PORT}`);
}


// Handle BigInt serialization
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

bootstrap();
