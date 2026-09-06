import { registerAs } from '@nestjs/config';

export interface RedisOptions {
  host: string;
  port: number;
  password?: string;
  db: number;
  keyPrefix: string;
  ttlSeconds: number;
}

export default registerAs(
  'redis',
  (): RedisOptions => ({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB || '0', 10),
    keyPrefix: 'nlams:',
    ttlSeconds: 300, // 5-minute default cache ttl
  }),
);
