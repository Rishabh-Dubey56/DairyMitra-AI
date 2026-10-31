import { Redis } from 'ioredis';
import { logger } from '../shared/utils/logger.js';

interface RedisHealth {
  status: 'connected' | 'disconnected' | 'fallback_memory';
  uptimeSeconds?: number;
  usedMemory?: string;
}

// In-Memory Bloom Filter Implementation
// Uses FNV-1a & Murmur-like multiple hash functions over a bit array
class InMemoryBloomFilter {
  private size: number;
  private bits: Uint8Array;
  private hashCount: number;

  constructor(expectedItems = 100000, falsePositiveRate = 0.01) {
    this.size = Math.ceil(-((expectedItems * Math.log(falsePositiveRate)) / (Math.log(2) ** 2)));
    this.hashCount = Math.ceil((this.size / expectedItems) * Math.log(2));
    this.bits = new Uint8Array(Math.ceil(this.size / 8));
  }

  private getHashes(value: string): number[] {
    const hashes: number[] = [];
    let h1 = 0x811c9dc5;
    let h2 = 0x27d4eb2f;

    for (let i = 0; i < value.length; i++) {
      const code = value.charCodeAt(i);
      h1 ^= code;
      h1 = Math.imul(h1, 0x01000193);
      h2 ^= code;
      h2 = Math.imul(h2, 0x5bd1e995);
    }

    for (let i = 0; i < this.hashCount; i++) {
      const combined = Math.abs((h1 + i * h2) % this.size);
      hashes.push(combined);
    }
    return hashes;
  }

  public add(item: string): void {
    const hashes = this.getHashes(item.toLowerCase().trim());
    for (const h of hashes) {
      const byteIndex = Math.floor(h / 8);
      const bitIndex = h % 8;
      this.bits[byteIndex] |= 1 << bitIndex;
    }
  }

  public has(item: string): boolean {
    const hashes = this.getHashes(item.toLowerCase().trim());
    for (const h of hashes) {
      const byteIndex = Math.floor(h / 8);
      const bitIndex = h % 8;
      if ((this.bits[byteIndex] & (1 << bitIndex)) === 0) {
        return false;
      }
    }
    return true;
  }
}

class RedisManager {
  private client: Redis | null = null;
  private isConnected = false;
  private memoryCache = new Map<string, { value: string; expiry?: number }>();
  public readonly bloomFilter: InMemoryBloomFilter;

  constructor() {
    this.bloomFilter = new InMemoryBloomFilter(100000, 0.01);
  }

  public async connect(): Promise<void> {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    const keyPrefix = process.env.REDIS_KEY_PREFIX || 'dm:';

    try {
      this.client = new Redis(redisUrl, {
        keyPrefix,
        lazyConnect: true,
        connectTimeout: 4000,
        maxRetriesPerRequest: 1,
        retryStrategy: (times) => {
          if (times > 2) return null; // fallback after 2 quick tries
          return Math.min(times * 500, 2000);
        },
      });

      this.client.on('connect', () => {
        this.isConnected = true;
        logger.info('Redis cache connection established successfully', 'Redis', { keyPrefix });
      });

      this.client.on('error', (err) => {
        this.isConnected = false;
        logger.debug(`Redis connection issue: ${err.message}. Using high-speed memory fallback.`, 'Redis');
      });

      await this.client.connect();
    } catch (err: any) {
      this.isConnected = false;
      logger.warn(
        `Redis unavailable on ${redisUrl}. In-memory high-speed cache & Bloom Filter activated.`,
        'Redis',
        { error: err.message }
      );
    }
  }

  public async get(key: string): Promise<string | null> {
    if (this.isConnected && this.client) {
      try {
        return await this.client.get(key);
      } catch {
        // Fallback
      }
    }

    const item = this.memoryCache.get(key);
    if (!item) return null;
    if (item.expiry && item.expiry < Date.now()) {
      this.memoryCache.delete(key);
      return null;
    }
    return item.value;
  }

  public async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (this.isConnected && this.client) {
      try {
        if (ttlSeconds) {
          await this.client.set(key, value, 'EX', ttlSeconds);
        } else {
          await this.client.set(key, value);
        }
        return;
      } catch {
        // Fallback
      }
    }

    const expiry = ttlSeconds ? Date.now() + ttlSeconds * 1000 : undefined;
    this.memoryCache.set(key, { value, expiry });
  }

  public async del(key: string): Promise<void> {
    if (this.isConnected && this.client) {
      try {
        await this.client.del(key);
        return;
      } catch {
        // Fallback
      }
    }
    this.memoryCache.delete(key);
  }

  public getHealth(): RedisHealth {
    if (this.isConnected) {
      return { status: 'connected' };
    }
    return {
      status: 'fallback_memory',
      usedMemory: `${this.memoryCache.size} in-memory keys`,
    };
  }

  public async disconnect(): Promise<void> {
    if (this.client && this.isConnected) {
      await this.client.quit();
      this.isConnected = false;
      logger.info('Redis connection pool disconnected gracefully', 'Redis');
    }
  }
}

export const redisManager = new RedisManager();
