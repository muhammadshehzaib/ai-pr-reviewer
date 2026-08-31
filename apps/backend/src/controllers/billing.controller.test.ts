import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BillingController } from './billing.controller';
import { MarketplaceService, AVAILABLE_PLANS } from '../services/marketplace.service';
import { mockReq, mockRes } from '../test-utils/express-mocks';

vi.mock('../services/marketplace.service', () => ({
  MarketplaceService: {
    getUserBillingOverview: vi.fn(),
  },
  AVAILABLE_PLANS: [
    { id: 'FREE', name: 'Free Plan', priceMonthly: 0 },
    { id: 'INDIE', name: 'Indie Plan', priceMonthly: 6 },
    { id: 'TEAM', name: 'Team Plan', priceMonthly: 12 },
  ],
}));

describe('BillingController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getPlans', () => {
    it('returns available plan tiers and marketplace URL', async () => {
      const req = mockReq();
      const res = mockRes();

      await BillingController.getPlans(req, res);

      expect(res.json).toHaveBeenCalledWith({
        plans: AVAILABLE_PLANS,
        marketplaceUrl: 'https://github.com/marketplace/ai-pr-reviewer',
      });
    });
  });

  describe('getUsage', () => {
    it('returns user billing overview for authenticated user', async () => {
      const fakeOverview = {
        plan: 'FREE',
        usage: {
          publicReviewsUsed: 5,
          privateReviewsUsed: 12,
          privateReviewLimit: 50,
          privateReviewsRemaining: 38,
        },
      };

      (MarketplaceService.getUserBillingOverview as any).mockResolvedValueOnce(fakeOverview);

      const req = mockReq({ auth: { userId: 'user-123', githubId: 'gh-456' } as any });
      const res = mockRes();

      await BillingController.getUsage(req, res);

      expect(MarketplaceService.getUserBillingOverview).toHaveBeenCalledWith('user-123');
      expect(res.json).toHaveBeenCalledWith(fakeOverview);
    });

    it('returns 500 when service throws an unexpected error', async () => {
      (MarketplaceService.getUserBillingOverview as any).mockRejectedValueOnce(
        new Error('DB failure')
      );

      const req = mockReq({ auth: { userId: 'user-123', githubId: 'gh-456' } as any });
      const res = mockRes();

      await BillingController.getUsage(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to retrieve billing overview' });
    });
  });
});
