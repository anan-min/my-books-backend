import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);


  const redisClient = app.get('REDIS_CLIENT');
  try {
    await redisClient.set('test-key', 'test-value');
    const value = await redisClient.get('test-key');
    console.log('Redis connection OK, test-key:', value);
  } catch (err) {
    console.error('Redis connection failed:', err);
  }



  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
