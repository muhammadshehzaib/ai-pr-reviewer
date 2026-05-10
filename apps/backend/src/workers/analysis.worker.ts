import { Worker, Job } from 'bullmq';
import { redisConnection } from '../config/redis';
import { ANALYSIS_QUEUE_NAME } from '../config/queue';
import prisma from '../config/prisma';

export const analysisWorker = new Worker(
  ANALYSIS_QUEUE_NAME,
  async (job: Job) => {
    console.log(`⚙️  Worker starting analysis processing on Job: ${job.id}`);
    
    const { jobId, repositoryId, fullName, eventType } = job.data;

    try {
      // 1. Update job state to RUNNING in Database
      await prisma.analysisJob.update({
        where: { id: jobId },
        data: { status: 'RUNNING' },
      });

      console.log(`⏳ [Worker] Analyzing ${fullName} (${eventType})...`);

      // --- PHASE 3 PLACEHOLDER: ACTUAL LOGIC GOES HERE ---
      // 1. Fetch Diff from GitHub API
      // 2. Hand to Gemini Agent
      // 3. Store AI Feedbacks
      
      // Simulate light network latency for pipeline realism
      await new Promise((r) => setTimeout(r, 2000));

      // --- END PLACEHOLDER ---

      // 2. Close loop update to COMPLETED
      await prisma.analysisJob.update({
        where: { id: jobId },
        data: { status: 'COMPLETED' },
      });

      console.log(`🎉 [Worker] Analysis for Job ${jobId} fully completed.`);
      return { success: true };
    } catch (err) {
      console.error(`🚨 [Worker] Job ${jobId} crashed:`, err);
      
      // Set failure state in database
      await prisma.analysisJob.update({
        where: { id: jobId },
        data: { status: 'FAILED' },
      });

      throw err; // Triggers automatic BullMQ retry mechanism
    }
  },
  {
    connection: redisConnection,
    concurrency: 5, // Processes 5 AI scans simultaneously!
  }
);

analysisWorker.on('ready', () => {
  console.log(`👷 Background Worker initialized and listening for tasks...`);
});
