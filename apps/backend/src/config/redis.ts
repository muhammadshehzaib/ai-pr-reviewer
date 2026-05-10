import IORedis from 'ioredis';

const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379', 10);

export const redisConnection = new IORedis({
  host: REDIS_HOST,
  port: REDIS_PORT,
  maxRetriesPerRequest: null, // Required for BullMQ stability
});

redisConnection.on('connect', () => {
  console.log(`✅ Redis Connected Successfully to ${REDIS_HOST}:${REDIS_PORT}`);
});

redisConnection.on('error', (err) => {
  console.error('❌ Redis Connection Error:', err);
});
