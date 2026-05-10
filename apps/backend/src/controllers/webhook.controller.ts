import { Request, Response } from 'express';
import { analysisQueue } from '../config/queue';
import prisma from '../config/prisma';

export class WebhookController {
  static async handleGitHubEvent(req: Request, res: Response) {
    const githubEventHeader = req.headers['x-github-event'];
    const payload = req.body;

    console.log(`📡 Received Webhook: ${githubEventHeader}`);

    // 1. Handle 'ping' events used by GitHub to test delivery
    if (githubEventHeader === 'ping') {
      return res.status(200).json({ message: 'pong' });
    }

    try {
      const repoFullName = payload.repository?.full_name;
      if (!repoFullName) {
        return res.status(400).json({ error: 'Invalid repository structure in payload' });
      }

      // 2. Verify system has this repository registered and active
      const dbRepo = await prisma.repository.findFirst({
        where: { fullName: repoFullName, isActive: true },
      });

      if (!dbRepo) {
        console.log(`⚠️ Skipping: Repo ${repoFullName} not active in system database.`);
        return res.status(200).json({ status: 'SKIPPED', reason: 'inactive-repository' });
      }

      let jobType: 'PULL_REQUEST' | 'PUSH' | null = null;
      let refId: string = '';

      // 3. Parse logic specifically for our targeted events
      if (githubEventHeader === 'pull_request') {
        // Only care about new creation or subsequent pushes to PR
        const allowedActions = ['opened', 'synchronize', 'reopened'];
        if (!allowedActions.includes(payload.action)) {
          return res.status(200).json({ status: 'SKIPPED', reason: `action-${payload.action}-ignored` });
        }
        jobType = 'PULL_REQUEST';
        refId = payload.pull_request.number.toString();
      } else if (githubEventHeader === 'push') {
        jobType = 'PUSH';
        refId = payload.after; // The specific new HEAD commit hash
      }

      if (!jobType) {
        return res.status(200).json({ status: 'SKIPPED', reason: 'unsupported-event-type' });
      }

      // 4. Persist basic Analysis Job log in DB as PENDING/QUEUED
      const newJob = await prisma.analysisJob.create({
        data: {
          repositoryId: dbRepo.id,
          eventType: jobType,
          referenceId: refId,
          status: 'QUEUED',
        },
      });

      // 5. FIRE AND FORGET INTO BULLMQ -> Instant 200 OK response for performance
      await analysisQueue.add(`analyze-${jobType}-${refId}`, {
        jobId: newJob.id,
        repositoryId: dbRepo.id,
        fullName: repoFullName,
        eventType: jobType,
        referenceId: refId,
        payloadSnapshot: {
          headSha: jobType === 'PULL_REQUEST' ? payload.pull_request.head.sha : payload.after,
          baseSha: jobType === 'PULL_REQUEST' ? payload.pull_request.base.sha : payload.before,
        }
      });

      console.log(`✅ Job queued successfully. ID: ${newJob.id}`);
      return res.status(202).json({
        status: 'QUEUED',
        jobId: newJob.id,
        message: 'Analysis task distributed to processing fleet.'
      });

    } catch (err) {
      console.error('💥 Error processing webhook payload:', err);
      return res.status(500).json({ error: 'Internal processing error' });
    }
  }
}
