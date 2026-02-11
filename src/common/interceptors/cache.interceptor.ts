import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  Inject,
} from '@nestjs/common';
import { tap } from 'rxjs/operators';
import { CACHE_KEY } from '../decorators/cache.decorator.js';
import { Reflector } from '@nestjs/core';
import { of } from 'rxjs';
import { REDIS_EX_NUM } from '../constants/constants.js';
import type { Redis } from '@upstash/redis';

@Injectable()
export class SmartCacheInterceptor implements NestInterceptor {
  constructor(
    private reflector: Reflector,
    @Inject('REDIS_CLIENT') private redis: Redis | null,
  ) { }

  async intercept(context: ExecutionContext, next: CallHandler): Promise<any> {
    const useCache = this.reflector.get<boolean>(
      CACHE_KEY,
      context.getHandler(),
    );
    if (!useCache) return next.handle();

    // Skip caching if Redis client is not available
    if (!this.redis) return next.handle();

    const request = context.switchToHttp().getRequest();
    const cacheKey = this.buildKey(request);

    try {
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        // @upstash/redis auto-deserializes JSON, so cached is already an object
        next.handle().subscribe(async (fresh) => {
          try {
            await this.redis.setex(cacheKey, REDIS_EX_NUM, JSON.stringify(fresh));
          } catch (e) {
            console.error('Redis cache write error:', e);
          }
        });

        return of({
          cached: true,
          data: cached,
        });
      }
    } catch (e) {
      // If Redis read fails, just proceed without cache
      console.error('Redis cache read error:', e);
      return next.handle();
    }

    return next.handle().pipe(
      tap(async (fresh) => {
        try {
          await this.redis.setex(cacheKey, REDIS_EX_NUM, JSON.stringify(fresh));
        } catch (e) {
          console.error('Redis cache write error:', e);
        }
      }),
    );
  }

  private buildKey(req: any) {
    return `cache:${req.method}:${req.route?.path}:${JSON.stringify(
      req.query,
    )}`;
  }
}
