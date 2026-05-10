import { Worker, Job } from 'bullmq';
import { redisConnection } from '../config/redis';
import { ANALYSIS_QUEUE_NAME } from '../config/queue';
import prisma from '../config/prisma';
import { EncryptionService } from '../services/encryption.service';
import { GitHubService } from '../services/github.service';
import { AiProviderFactory } from '../services/ai/ai-factory';
import { SocketService } from '../config/socket';

export const analysisWorker = new Worker(
  ANALYSIS_QUEUE_NAME,
  async (job: Job) => {
    console.log(`\n⚙️  WORKER: Awakening for Job ${job.id}...`);

    const { jobId, repositoryId, fullName, eventType, referenceId, payloadSnapshot } = job.data;
    const [owner, repo] = fullName.split('/');

    try {
      // 1. Update state to RUNNING
      await prisma.analysisJob.update({
        where: { id: jobId },
        data: { status: 'RUNNING' },
      });
      
      SocketService.emitStatus(jobId, '🚀 Worker Active: Analysis Cycle Commenced', 'RUNNING');

      // 2. Fetch User associated with Repository & retrieve their SECURE KEY
      const dbRepo = await prisma.repository.findUnique({
        where: { id: repositoryId },
        include: { user: { include: { vault: true } } },
      });

      if (!dbRepo || !dbRepo.user.vault) {
        throw new Error('Repository not linked to an active security vault');
      }

      const vault = dbRepo.user.vault;
      console.log(`🔑 Vault Detected: Using user preference [${vault.provider}] engine.`);
      SocketService.emitStatus(jobId, `🔐 Unlocking Security Vault [Provider: ${vault.provider}]`, 'RUNNING');

      // 3. DECRYPT THE KEY IN RAM TEMPORARILY
      const rawApiKey = EncryptionService.decrypt(
        vault.encryptedGeminiKey,
        vault.iv,
        vault.authTag
      );

      // 4. BOOT CONNECTORS
      const githubToken = process.env.GITHUB_ACCESS_TOKEN || ''; 
      const ghService = new GitHubService(githubToken);

      // 5. FETCH THE GIT DIFF
      SocketService.emitStatus(jobId, `📡 Fetching Raw Diff Stream from GitHub`, 'RUNNING');
      const { baseSha, headSha } = payloadSnapshot;
      const rawDiff = await ghService.fetchDiff(owner, repo, baseSha, headSha);
      
      if (!rawDiff || rawDiff.length < 5) {
        console.log(`💨 Diff empty or too small. Finishing early.`);
        return await prisma.analysisJob.update({ where: { id: jobId }, data: { status: 'COMPLETED' } });
      }

      // 6. ENGAGE AI ENGINE VIA FACTORY
      console.log(`🧠 Contacting ${vault.provider} for Analysis Strategy...`);
      SocketService.emitStatus(jobId, `🧠 AI Dispatching to ${vault.provider} Models`, 'RUNNING');
      
      const aiDriver = AiProviderFactory.getProvider(vault.provider, rawApiKey);
      
      const suggestions = await aiDriver.analyzeCode(rawDiff);
      console.log(`🎯 AI Analysis Finished! Located ${suggestions.length} distinct findings.`);
      SocketService.emitStatus(jobId, `🎯 Scan Complete: ${suggestions.length} items found`, 'RUNNING');

      // 7. POST SUGGESTIONS TO GITHUB & SAVE TO DB
      // Save full raw payload into the Job results JSON for the frontend
      await prisma.analysisJob.update({
        where: { id: jobId },
        data: { 
          status: 'COMPLETED',
          results: suggestions as any // Type casting for JSONB Prisma compatibility
        },
      });

      // 8. LOOP FEEDBACK (Optional Phase 4 trigger)
      // Only possible to inline comment if it was an active Pull Request event
      if (eventType === 'PULL_REQUEST' && suggestions.length > 0) {
         console.log(`📬 Broadcasting inline review comments back to Pull Request #${referenceId}...`);
         SocketService.emitStatus(jobId, `📬 Injecting Inline Comments onto GitHub PR`, 'RUNNING');
         const prNum = parseInt(referenceId, 10);

         for (const suggestion of suggestions) {
            // Formulate the constructive markdown feedback body
            const commentBody = `### 🤖 AI Audit Report: ${suggestion.agentType}\n**Issue:** ${suggestion.issue}\n\n\`\`\`\n${suggestion.suggestion}\n\`\`\``;

            await ghService.createReviewComment(
               owner, 
               repo, 
               prNum, 
               headSha, 
               suggestion.filePath, 
               suggestion.lineNumber, 
               commentBody
            );
         }
      }

      console.log(`🏁 Job Cycle ${jobId} gracefully exited with 100% success.\n`);
      SocketService.emitStatus(jobId, `✅ All Analysis Finalized. Results fully loaded.`, 'COMPLETED', { suggestions });
      
      return { status: 'success', findingCount: suggestions.length };

    } catch (err) {
      console.error(`🚨 JOB FATALITY: ${jobId} died:`, err);
      SocketService.emitStatus(jobId, `🚨 Fatal Error Encountered: ${(err as Error).message}`, 'FAILED');
      await prisma.analysisJob.update({
        where: { id: jobId },
        data: { status: 'FAILED' },
      });
      throw err; // Relaunches BullMQ Retry logic automatically
    }
  },
  {
    connection: redisConnection,
    concurrency: 5,
  }
);

analysisWorker.on('ready', () => console.log(`👷 Background worker processing fleet active.`));
