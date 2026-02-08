import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from '@upstash/redis';

@Global()
@Module({
  exports: ['REDIS_CLIENT'],
  providers: [
    {
      provide: 'REDIS_CLIENT',
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        const url = config.get<string>('UPSTASH_REDIS_REST_URL');
        const token = config.get<string>('UPSTASH_REDIS_REST_TOKEN');

        if (!url || !token) {
          console.warn('UPSTASH_REDIS_REST_URL or TOKEN not set - Redis disabled');
          return null;
        }

        try {
          const redis = new Redis({ url, token });
          // Test connection
          await redis.ping();
          console.log('Connected to Upstash Redis successfully!');
          return redis;
        } catch (err) {
          // Don't crash the app - just disable Redis
          console.error('Failed to connect to Upstash Redis: ' + err.message);
          console.warn('App will continue without Redis caching');
          return null;
        }
      },
    },
  ],
})
export class RedisModule { }
