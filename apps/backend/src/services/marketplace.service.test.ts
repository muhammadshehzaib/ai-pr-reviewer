import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MarketplaceService, MarketplacePurchasePayload } from './marketplace.service';
import prisma from '../config/prisma';

vi.mock('../config/prisma', () => ({
  default: {
    installation: {
      upsert: vi.fn(),
      updateMany: vi.fn(),
      findMany: vi.fn(),
    },
    usageLedger: {
      upsert: vi.fn(),
    },
  },
}));

describe('MarketplaceService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('mapPlanNameToTier', () => {
    it('maps free plan names to FREE tier', () => {
      expect(MarketplaceService.mapPlanNameToTier('Free Plan')).toBe('FREE');
      expect(MarketplaceService.mapPlanNameToTier('free')).toBe('FREE');
      expect(MarketplaceService.mapPlanNameToTier(null)).toBe('FREE');
      expect(MarketplaceService.mapPlanNameToTier('')).toBe('FREE');
    });

    it('maps indie and pro plan names to INDIE tier', () => {
      expect(MarketplaceService.mapPlanNameToTier('Indie Plan')).toBe('INDIE');
      expect(MarketplaceService.mapPlanNameToTier('Pro Developer')).toBe('INDIE');
      expect(MarketplaceService.mapPlanNameToTier('solo-plan')).toBe('INDIE');
    });

    it('maps team and organization plan names to TEAM tier', () => {
      expect(MarketplaceService.mapPlanNameToTier('Team Plan')).toBe('TEAM');
      expect(MarketplaceService.mapPlanNameToTier('Organization Scale')).toBe('TEAM');
      expect(MarketplaceService.mapPlanNameToTier('Enterprise Tier')).toBe('TEAM');
    });
  });

  describe('handleMarketplaceEvent — purchased & changed', () => {
    const createPayload = (action: any, planName: string, unitCount: number = 1): MarketplacePurchasePayload => ({
      action,
      marketplace_purchase: {
        account: {
          id: 12345,
          login: 'octocat',
          type: 'User',
        },
        billing_cycle: 'monthly',
        unit_count: unitCount,
        on_free_trial: false,
        next_billing_date: '2026-10-01T00:00:00Z',
        plan: {
          id: 999,
          name: planName,
        },
      },
    });

    it('upserts installation on "purchased" with INDIE plan', async () => {
      (prisma.installation.upsert as any).mockResolvedValueOnce({
        id: 'inst-1',
        githubInstallationId: BigInt(12345),
        plan: 'INDIE',
      });

      const result = await MarketplaceService.handleMarketplaceEvent(
        createPayload('purchased', 'Indie Plan')
      );

      expect(result.plan).toBe('INDIE');
      expect(result.status).toBe('ACTIVE');
      expect(prisma.installation.upsert).toHaveBeenCalledWith({
        where: { githubInstallationId: BigInt(12345) },
        update: expect.objectContaining({
          plan: 'INDIE',
          marketplacePlanName: 'Indie Plan',
          marketplaceStatus: 'ACTIVE',
        }),
        create: expect.objectContaining({
          plan: 'INDIE',
          marketplacePlanName: 'Indie Plan',
          marketplaceStatus: 'ACTIVE',
        }),
      });
    });

    it('updates installation on "changed" to TEAM plan', async () => {
      (prisma.installation.upsert as any).mockResolvedValueOnce({
        id: 'inst-1',
        githubInstallationId: BigInt(12345),
        plan: 'TEAM',
      });

      const result = await MarketplaceService.handleMarketplaceEvent(
        createPayload('changed', 'Team Plan', 5)
      );

      expect(result.plan).toBe('TEAM');
      expect(result.status).toBe('ACTIVE');
      expect(prisma.installation.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          update: expect.objectContaining({
            plan: 'TEAM',
            marketplaceUnitCount: 5,
          }),
        })
      );
    });

    it('reverts plan to FREE on "cancelled"', async () => {
      (prisma.installation.updateMany as any).mockResolvedValueOnce({ count: 1 });

      const result = await MarketplaceService.handleMarketplaceEvent(
        createPayload('cancelled', 'Indie Plan')
      );

      expect(result.plan).toBe('FREE');
      expect(result.status).toBe('CANCELLED');
      expect(prisma.installation.updateMany).toHaveBeenCalledWith({
        where: { githubInstallationId: BigInt(12345) },
        data: {
          plan: 'FREE',
          marketplaceStatus: 'CANCELLED',
        },
      });
    });
  });

  describe('getUserBillingOverview', () => {
    it('returns billing and review metrics for user on FREE plan', async () => {
      (prisma.installation.findMany as any).mockResolvedValueOnce([
        {
          id: 'inst-1',
          plan: 'FREE',
          billingCycle: 'monthly',
          marketplaceStatus: 'ACTIVE',
          nextBillingDate: null,
          repositories: [],
        },
      ]);

      (prisma.usageLedger.upsert as any).mockResolvedValueOnce({
        publicReviewsCount: 15,
        privateReviewsCount: 20,
      });

      const overview = await MarketplaceService.getUserBillingOverview('u-1');

      expect(overview.plan).toBe('FREE');
      expect(overview.usage.privateReviewsUsed).toBe(20);
      expect(overview.usage.privateReviewLimit).toBe(50);
      expect(overview.usage.privateReviewsRemaining).toBe(30);
      expect(overview.usage.isLimitReached).toBe(false);
      expect(overview.availablePlans).toHaveLength(3);
    });
  });
});
