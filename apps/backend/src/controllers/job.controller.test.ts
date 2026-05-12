import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockJobFindMany, mockJobFindFirst } = vi.hoisted(() => ({
  mockJobFindMany: vi.fn(),
  mockJobFindFirst: vi.fn(),
}));

vi.mock('../config/prisma', () => ({
  default: {
    analysisJob: { findMany: mockJobFindMany, findFirst: mockJobFindFirst },
  },
}));

import { JobController } from './job.controller';
import { mockReq, mockRes } from '../test-utils/express-mocks';

const authedReq = (overrides = {}) => {
  const req = mockReq(overrides);
  (req as any).auth = { userId: 'u-1', githubId: 'gh' };
  return req;
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('JobController.list', () => {
  it('returns the user\'s jobs with findingCount derived from results array', async () => {
    mockJobFindMany.mockResolvedValueOnce([
      {
        id: 'j1',
        eventType: 'PULL_REQUEST',
        referenceId: '1',
        status: 'COMPLETED',
        createdAt: new Date(),
        updatedAt: new Date(),
        repository: { id: 'r1', fullName: 'o/r' },
        results: [{ x: 1 }, { x: 2 }, { x: 3 }],
      },
    ]);

    const req = authedReq();
    const res = mockRes();

    await JobController.list(req, res);

    const out = res.json.mock.calls[0][0];
    expect(out.jobs[0].findingCount).toBe(3);
    expect(out.jobs[0]).not.toHaveProperty('results'); // lightweight, no full results
  });

  it('returns findingCount 0 when results is null/non-array', async () => {
    mockJobFindMany.mockResolvedValueOnce([
      { id: 'j1', eventType: 'PUSH', referenceId: 'x', status: 'QUEUED', createdAt: new Date(), updatedAt: new Date(), repository: { id: 'r', fullName: 'o/r' }, results: null },
      { id: 'j2', eventType: 'PUSH', referenceId: 'y', status: 'FAILED', createdAt: new Date(), updatedAt: new Date(), repository: { id: 'r', fullName: 'o/r' }, results: { not: 'array' } },
    ]);

    const req = authedReq();
    const res = mockRes();

    await JobController.list(req, res);

    const out = res.json.mock.calls[0][0];
    expect(out.jobs[0].findingCount).toBe(0);
    expect(out.jobs[1].findingCount).toBe(0);
  });

  it('clamps absurdly large limit values to the max (100)', async () => {
    mockJobFindMany.mockResolvedValueOnce([]);
    const req = authedReq({ query: { limit: '99999' } });
    const res = mockRes();

    await JobController.list(req, res);

    expect(mockJobFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 100 }),
    );
  });

  it('clamps negative limit values to a minimum of 1', async () => {
    // Note: limit=0 short-circuits to the default (50) via `parseInt(...) || DEFAULT_LIMIT`.
    // Only truly-negative parses (e.g., "-5") actually exercise the Math.max(.., 1) floor.
    mockJobFindMany.mockResolvedValueOnce([]);
    const req = authedReq({ query: { limit: '-5' } });
    const res = mockRes();

    await JobController.list(req, res);

    expect(mockJobFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 1 }),
    );
  });

  it('falls back to default limit (50) when limit param is unparseable', async () => {
    mockJobFindMany.mockResolvedValueOnce([]);
    const req = authedReq({ query: { limit: 'banana' } });
    const res = mockRes();

    await JobController.list(req, res);

    expect(mockJobFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 50 }),
    );
  });

  it('applies repositoryId filter when provided', async () => {
    mockJobFindMany.mockResolvedValueOnce([]);
    const req = authedReq({ query: { repositoryId: 'r-42' } });
    const res = mockRes();

    await JobController.list(req, res);

    const arg = mockJobFindMany.mock.calls[0][0];
    expect(arg.where).toMatchObject({ repositoryId: 'r-42' });
  });

  it('always scopes by the auth user (regression guard against IDOR)', async () => {
    mockJobFindMany.mockResolvedValueOnce([]);
    const req = authedReq();
    const res = mockRes();

    await JobController.list(req, res);

    const arg = mockJobFindMany.mock.calls[0][0];
    expect(arg.where.repository).toEqual({ userId: 'u-1' });
  });
});

describe('JobController.get', () => {
  it('returns the job when it belongs to the user', async () => {
    mockJobFindFirst.mockResolvedValueOnce({ id: 'j1', status: 'COMPLETED' });
    const req = authedReq({ params: { id: 'j1' } });
    const res = mockRes();

    await JobController.get(req, res);

    expect(res.json).toHaveBeenCalledWith({ job: { id: 'j1', status: 'COMPLETED' } });
  });

  it('returns 404 when the job is missing or owned by another user', async () => {
    mockJobFindFirst.mockResolvedValueOnce(null);
    const req = authedReq({ params: { id: 'j-not-mine' } });
    const res = mockRes();

    await JobController.get(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Job not found' });
  });

  it('always filters by auth.userId (IDOR guard)', async () => {
    mockJobFindFirst.mockResolvedValueOnce(null);
    const req = authedReq({ params: { id: 'j1' } });
    const res = mockRes();

    await JobController.get(req, res);

    const arg = mockJobFindFirst.mock.calls[0][0];
    expect(arg.where.id).toBe('j1');
    expect(arg.where.repository).toEqual({ userId: 'u-1' });
  });
});
