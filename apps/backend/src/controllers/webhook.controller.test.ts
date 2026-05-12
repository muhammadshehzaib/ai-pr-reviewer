import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockRepoFindFirst, mockJobCreate, mockQueueAdd } = vi.hoisted(() => ({
  mockRepoFindFirst: vi.fn(),
  mockJobCreate: vi.fn(),
  mockQueueAdd: vi.fn(),
}));

vi.mock('../config/prisma', () => ({
  default: {
    repository: { findFirst: mockRepoFindFirst },
    analysisJob: { create: mockJobCreate },
  },
}));

vi.mock('../config/queue', () => ({
  analysisQueue: { add: mockQueueAdd },
  ANALYSIS_QUEUE_NAME: 'test-queue',
}));

import { WebhookController } from './webhook.controller';
import { mockReq, mockRes } from '../test-utils/express-mocks';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('WebhookController.handleGitHubEvent — ping', () => {
  it('responds 200 pong to a ping event', async () => {
    const req = mockReq({ headers: { 'x-github-event': 'ping' }, body: {} });
    const res = mockRes();

    await WebhookController.handleGitHubEvent(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'pong' });
    expect(mockQueueAdd).not.toHaveBeenCalled();
  });
});

describe('WebhookController.handleGitHubEvent — pull_request', () => {
  const baseRepo = { id: 'r1', isActive: true };
  const prBody = (action: string) => ({
    action,
    repository: { full_name: 'o/r' },
    pull_request: {
      number: 7,
      head: { sha: 'head-sha' },
      base: { sha: 'base-sha' },
    },
  });

  it('queues a PULL_REQUEST job when action is "opened"', async () => {
    mockRepoFindFirst.mockResolvedValueOnce(baseRepo);
    mockJobCreate.mockResolvedValueOnce({ id: 'job-1' });

    const req = mockReq({
      headers: { 'x-github-event': 'pull_request' },
      body: prBody('opened'),
    });
    const res = mockRes();

    await WebhookController.handleGitHubEvent(req, res);

    expect(mockJobCreate).toHaveBeenCalledWith({
      data: {
        repositoryId: 'r1',
        eventType: 'PULL_REQUEST',
        referenceId: '7',
        status: 'QUEUED',
      },
    });
    expect(mockQueueAdd).toHaveBeenCalledWith(
      'analyze-PULL_REQUEST-7',
      expect.objectContaining({
        jobId: 'job-1',
        eventType: 'PULL_REQUEST',
        payloadSnapshot: { headSha: 'head-sha', baseSha: 'base-sha' },
      }),
    );
    expect(res.status).toHaveBeenCalledWith(202);
  });

  it.each(['synchronize', 'reopened'])(
    'queues a job for action "%s" too',
    async (action) => {
      mockRepoFindFirst.mockResolvedValueOnce(baseRepo);
      mockJobCreate.mockResolvedValueOnce({ id: 'j' });

      const req = mockReq({
        headers: { 'x-github-event': 'pull_request' },
        body: prBody(action),
      });
      const res = mockRes();

      await WebhookController.handleGitHubEvent(req, res);

      expect(mockQueueAdd).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(202);
    },
  );

  it('skips when action is "closed" / "labeled" etc.', async () => {
    mockRepoFindFirst.mockResolvedValueOnce(baseRepo);

    const req = mockReq({
      headers: { 'x-github-event': 'pull_request' },
      body: prBody('closed'),
    });
    const res = mockRes();

    await WebhookController.handleGitHubEvent(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: 'SKIPPED',
      reason: 'action-closed-ignored',
    });
    expect(mockQueueAdd).not.toHaveBeenCalled();
  });
});

describe('WebhookController.handleGitHubEvent — push', () => {
  it('queues a PUSH job using the after SHA as referenceId', async () => {
    mockRepoFindFirst.mockResolvedValueOnce({ id: 'r1', isActive: true });
    mockJobCreate.mockResolvedValueOnce({ id: 'job-2' });

    const req = mockReq({
      headers: { 'x-github-event': 'push' },
      body: {
        repository: { full_name: 'o/r' },
        before: 'before-sha',
        after: 'after-sha',
      },
    });
    const res = mockRes();

    await WebhookController.handleGitHubEvent(req, res);

    expect(mockQueueAdd).toHaveBeenCalledWith(
      'analyze-PUSH-after-sha',
      expect.objectContaining({
        eventType: 'PUSH',
        referenceId: 'after-sha',
        payloadSnapshot: { headSha: 'after-sha', baseSha: 'before-sha' },
      }),
    );
    expect(res.status).toHaveBeenCalledWith(202);
  });
});

describe('WebhookController.handleGitHubEvent — breaking path', () => {
  it('returns 400 when payload has no repository.full_name', async () => {
    const req = mockReq({
      headers: { 'x-github-event': 'pull_request' },
      body: { action: 'opened' },
    });
    const res = mockRes();

    await WebhookController.handleGitHubEvent(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(mockQueueAdd).not.toHaveBeenCalled();
  });

  it('skips unknown repos (not active in DB) with status 200', async () => {
    mockRepoFindFirst.mockResolvedValueOnce(null);

    const req = mockReq({
      headers: { 'x-github-event': 'pull_request' },
      body: {
        action: 'opened',
        repository: { full_name: 'unknown/repo' },
        pull_request: { number: 1, head: { sha: 'h' }, base: { sha: 'b' } },
      },
    });
    const res = mockRes();

    await WebhookController.handleGitHubEvent(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: 'SKIPPED',
      reason: 'inactive-repository',
    });
    expect(mockQueueAdd).not.toHaveBeenCalled();
  });

  it('skips unsupported event types (e.g., "star")', async () => {
    mockRepoFindFirst.mockResolvedValueOnce({ id: 'r1', isActive: true });

    const req = mockReq({
      headers: { 'x-github-event': 'star' },
      body: { repository: { full_name: 'o/r' } },
    });
    const res = mockRes();

    await WebhookController.handleGitHubEvent(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: 'SKIPPED',
      reason: 'unsupported-event-type',
    });
    expect(mockQueueAdd).not.toHaveBeenCalled();
  });

  it('returns 500 when DB write fails', async () => {
    mockRepoFindFirst.mockResolvedValueOnce({ id: 'r1', isActive: true });
    mockJobCreate.mockRejectedValueOnce(new Error('DB exploded'));

    const req = mockReq({
      headers: { 'x-github-event': 'pull_request' },
      body: {
        action: 'opened',
        repository: { full_name: 'o/r' },
        pull_request: { number: 1, head: { sha: 'h' }, base: { sha: 'b' } },
      },
    });
    const res = mockRes();

    await WebhookController.handleGitHubEvent(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Internal processing error' });
  });
});
