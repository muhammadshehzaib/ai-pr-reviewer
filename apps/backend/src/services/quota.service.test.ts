import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QuotaService } from './quota.service';
import prisma from '../config/prisma';

vi.mock('../config/prisma', () => ({
  default: {
    installation: {
      findUnique: vi.fn(),
    },
    usageLedger: {
      upsert: vi.fn(),
    },
  },
}));

describe('QuotaService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('allows unlimited reviews on public repositories regardless of count', async () => {
    (prisma.usageLedger.upsert as any).mockResolvedValueOnce({
      publicReviewsCount: 150,
      privateReviewsCount: 0,
    });

    const result = await QuotaService.checkQuota('inst-123', false);
    expect(result.allowed).toBe(true);
    expect(result.usage.limit).toBeNull();
  });

  it('allows private reviews when within the 50 reviews/month free quota', async () => {
    (prisma.installation.findUnique as any).mockResolvedValueOnce({
      id: 'inst-123',
      plan: 'FREE',
    });

    (prisma.usageLedger.upsert as any).mockResolvedValueOnce({
      publicReviewsCount: 10,
      privateReviewsCount: 42,
    });

    const result = await QuotaService.checkQuota('inst-123', true);
    expect(result.allowed).toBe(true);
    expect(result.usage.current).toBe(42);
    expect(result.usage.limit).toBe(50);
  });

  it('rejects private reviews when monthly free quota is reached (>= 50)', async () => {
    (prisma.installation.findUnique as any).mockResolvedValueOnce({
      id: 'inst-123',
      plan: 'FREE',
    });

    (prisma.usageLedger.upsert as any).mockResolvedValueOnce({
      publicReviewsCount: 5,
      privateReviewsCount: 50,
    });

    const result = await QuotaService.checkQuota('inst-123', true);
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('Monthly free tier quota exceeded');
    expect(result.usage.current).toBe(50);
    expect(result.usage.limit).toBe(50);
  });

  it('allows unlimited private reviews for INDIE and TEAM plans', async () => {
    (prisma.installation.findUnique as any).mockResolvedValueOnce({
      id: 'inst-paid',
      plan: 'INDIE',
    });

    (prisma.usageLedger.upsert as any).mockResolvedValueOnce({
      publicReviewsCount: 20,
      privateReviewsCount: 250,
    });

    const result = await QuotaService.checkQuota('inst-paid', true);
    expect(result.allowed).toBe(true);
    expect(result.usage.limit).toBeNull();
  });
});
