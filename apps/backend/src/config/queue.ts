import { Queue } from 'bullmq';
import { redisConnection } from './redis';

export const ANALYSIS_QUEUE_NAME = 'code-analysis-queue';

export const analysisQueue = new Queue(ANALYSIS_QUEUE_NAME, {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3, // Retry up to 3 times if failing
    backoff: {
      type: 'exponential',
      delay: 1000, // Wait 1s, then 2s, then 4s
    },
    removeOnComplete: true, // Clean up redis memory automatically
    removeOnFail: false, // Keep failures for inspection
  },
});

console.log(`📦 BullMQ Queue [${ANALYSIS_QUEUE_NAME}] Initialized`);
