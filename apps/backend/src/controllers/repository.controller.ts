import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { GitHubService } from '../services/github.service';
import { analysisQueue } from '../config/queue';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';

function getBotGitHub(): GitHubService {
  const token = process.env.GITHUB_ACCESS_TOKEN;
  if (!token) throw new Error('GITHUB_ACCESS_TOKEN not configured');
  return new GitHubService(token);
}

export class RepositoryController {
  static async list(req: Request, res: Response) {
    const repos = await prisma.repository.findMany({
      where: { userId: req.auth!.userId },
      orderBy: { createdAt: 'desc' },
    });
    // BigInt is not JSON-serializable — coerce to string
    return res.json({
      repositories: repos.map((r) => ({ ...r, githubRepoId: r.githubRepoId.toString() })),
    });
  }

  static async register(req: Request, res: Response) {
    const { fullName } = req.body ?? {};
    if (!fullName || typeof fullName !== 'string' || !fullName.includes('/')) {
      return res.status(400).json({ error: 'fullName must be in "owner/repo" form' });
    }

    const [owner, repo] = fullName.split('/');
    const existing = await prisma.repository.findFirst({
      where: { userId: req.auth!.userId, fullName },
    });
    if (existing) {
      return res.status(409).json({ error: 'Repository already registered' });
    }

    try {
      const gh = getBotGitHub();
      const ghRepo = await gh.getRepo(owner, repo);
      const webhookUrl = `${BACKEND_URL}/api/webhooks/github`;
      const hookId = await gh.createWebhook(
        owner,
        repo,
        webhookUrl,
        process.env.GITHUB_WEBHOOK_SECRET,
      );

      const dbRepo = await prisma.repository.create({
        data: {
          userId: req.auth!.userId,
          githubRepoId: BigInt(ghRepo.id),
          fullName,
          webhookId: hookId,
          isActive: true,
        },
      });

      return res.status(201).json({
        repository: { ...dbRepo, githubRepoId: dbRepo.githubRepoId.toString() },
      });
    } catch (err) {
      console.error('🔴 Repo registration failure:', err);
      return res.status(500).json({ error: (err as Error).message });
    }
  }

  static async deactivate(req: Request, res: Response) {
    const { id } = req.params;
    const repo = await prisma.repository.findFirst({
      where: { id, userId: req.auth!.userId },
    });
    if (!repo) return res.status(404).json({ error: 'Repository not found' });

    if (repo.webhookId) {
      try {
        const [owner, name] = repo.fullName.split('/');
        await getBotGitHub().deleteWebhook(owner, name, Number(repo.webhookId));
      } catch (err) {
        console.warn('⚠️ Failed to delete GitHub webhook — proceeding with DB deactivation:', err);
      }
    }

    await prisma.repository.update({
      where: { id: repo.id },
      data: { isActive: false, webhookId: null },
    });

    return res.json({ status: 'OK' });
  }

  /**
   * Manually queues an analysis job. Accepts either:
   *   { pullNumber: number }  — resolves base/head from GitHub
   *   { headSha, baseSha }    — pushes a synthetic commit-range job
   */
  static async triggerAnalysis(req: Request, res: Response) {
    const { id } = req.params;
    const { pullNumber, headSha, baseSha } = req.body ?? {};

    const repo = await prisma.repository.findFirst({
      where: { id, userId: req.auth!.userId, isActive: true },
    });
    if (!repo) return res.status(404).json({ error: 'Repository not found or inactive' });

    const [owner, name] = repo.fullName.split('/');
    let eventType: 'PULL_REQUEST' | 'PUSH';
    let referenceId: string;
    let resolvedHead: string;
    let resolvedBase: string;

    try {
      if (pullNumber) {
        const pr = await getBotGitHub().getPullRequest(owner, name, Number(pullNumber));
        eventType = 'PULL_REQUEST';
        referenceId = String(pullNumber);
        resolvedHead = pr.head.sha;
        resolvedBase = pr.base.sha;
      } else if (headSha && baseSha) {
        eventType = 'PUSH';
        referenceId = headSha;
        resolvedHead = headSha;
        resolvedBase = baseSha;
      } else {
        return res
          .status(400)
          .json({ error: 'Provide either { pullNumber } or { headSha, baseSha }' });
      }
    } catch (err) {
      return res.status(502).json({ error: `GitHub lookup failed: ${(err as Error).message}` });
    }

    const job = await prisma.analysisJob.create({
      data: {
        repositoryId: repo.id,
        eventType,
        referenceId,
        status: 'QUEUED',
      },
    });

    await analysisQueue.add(`manual-${eventType}-${referenceId}`, {
      jobId: job.id,
      repositoryId: repo.id,
      fullName: repo.fullName,
      eventType,
      referenceId,
      payloadSnapshot: { headSha: resolvedHead, baseSha: resolvedBase },
    });

    return res.status(202).json({ jobId: job.id, status: 'QUEUED' });
  }
}
