import { Module } from '@nestjs/common';
import { createClient } from 'redis';



const redisProvider = {
  provide: 'REDIS_CLIENT',
  useFactory: async () => {
    const client = createClient({ url: 'redis://localhost:6379' });
    await client.connect();
    return client;
  },
};


@Module({
    providers: [redisProvider],
    exports: [redisProvider]
})

export class RedisModule {
  
}



