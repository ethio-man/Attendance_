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
          console.log(' Connected to Upstash Redis successfully!');
          return redis;
        } catch (err) {
          console.error("Can't connect to Upstash Redis: " + err.message);
          throw new Error("Can't connect to Upstash Redis!");
        }
      },
    },
  ],
})
export class RedisModule { }
