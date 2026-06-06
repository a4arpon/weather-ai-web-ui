import Redis from "ioredis"

import { ServerENV } from "#app/lib/server/env"

interface CacheItem<T> {
  value: T
  expiresAt: number
}

export class CacheDriver {
  private redis: Redis

  constructor(private namespace = "weather-ai-cache") {
    this.redis = new Redis(ServerENV.REDIS_URL)
  }

  private getKey(key: string): string {
    return `${this.namespace}:${key}`
  }

  async get<T>(key: string): Promise<T | null> {
    const fullKey = this.getKey(key)

    const data = await this.redis.get(fullKey)
    if (!data) return null

    const item = JSON.parse(data) as CacheItem<T>

    if (Date.now() > item.expiresAt) {
      await this.redis.del(fullKey)
      return null
    }

    return item.value
  }

  async set<T>(key: string, value: T, ttlSeconds = 600): Promise<void> {
    const fullKey = this.getKey(key)

    const item: CacheItem<T> = {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000 // Default TTL is 10 minutes
    }

    await this.redis.set(fullKey, JSON.stringify(item), "EX", ttlSeconds)
  }

  async invalidate(key: string): Promise<void> {
    const fullKey = this.getKey(key)

    await this.redis.del(fullKey)
  }
}

export const defaultCacheDriver = new CacheDriver()
