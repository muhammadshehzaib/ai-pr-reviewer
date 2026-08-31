import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MarketplaceService, MarketplacePurchasePayload, AVAILABLE_PLANS } from './marketplace.service';
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
    it('maps free and empty plan names to FREE tier', () => {
      expect(MarketplaceService.mapPlanNameToTier('Free Plan')).toBe('FREE');
      expect(MarketplaceService.mapPlanNameToTier('free')).toBe('FREE');
      expect(MarketplaceService.mapPlanNameToTier(null)).toBe('FREE');
      expect(MarketplaceService.mapPlanNameToTier(undefined)).toBe('FREE');
      expect(MarketplaceService.mapPlanNameToTier('')).toBe('FREE');
      expect(MarketplaceService.mapPlanNameToTier('unknown-random-tier')).toBe('FREE');
    });

    it('maps indie, pro, solo, and developer plan names to INDIE tier', () => {
      expect(MarketplaceService.mapPlanNameToTier('Indie Plan')).toBe('INDIE');
      expect(MarketplaceService.mapPlanNameToTier('INDIE')).toBe('INDIE');
      expect(MarketplaceService.mapPlanNameToTier('Pro Developer')).toBe('INDIE');
      expect(MarketplaceService.mapPlanNameToTier('solo-plan')).toBe('INDIE');
      expect(MarketplaceService.mapPlanNameToTier('developer-tier')).toBe('INDIE');
    });

    it('maps team, org, business, and enterprise plan names to TEAM tier', () => {
      expect(MarketplaceService.mapPlanNameToTier('Team Plan')).toBe('TEAM');
      expect(MarketplaceService.mapPlanNameToTier('TEAM')).toBe('TEAM');
      expect(MarketplaceService.mapPlanNameToTier('Organization Scale')).toBe('TEAM');
      expect(MarketplaceService.mapPlanNameToTier('Business Pro')).toBe('TEAM');
      expect(MarketplaceService.mapPlanNameToTier('Enterprise Tier')).toBe('TEAM');
    });
  });

  describe('handleMarketplaceEvent — happy & edge cases', () => {
    const createPayload = (
      action: any,
      planName: string,
      unitCount: number = 1,
      overrides: Record<string, any> = {}
    ): MarketplacePurchasePayload => ({
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
        ...overrides,
      },
    });

    it('throws error when payload is missing account or plan structure', async () => {
      await expect(
        MarketplaceService.handleMarketplaceEvent({ action: 'purchased' } as any)
      ).rejects.toThrow('Invalid marketplace purchase payload structure');

      await expect(
        MarketplaceService.handleMarketplaceEvent({
          action: 'purchased',
          marketplace_purchase: { account: { id: 1 } },
        } as any)
      ).rejects.toThrow('Invalid marketplace purchase payload structure');
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
          accountLogin: 'octocat',
          accountType: 'User',
          plan: 'INDIE',
          marketplacePlanId: BigInt(999),
          marketplacePlanName: 'Indie Plan',
          marketplaceStatus: 'ACTIVE',
          billingCycle: 'monthly',
        }),
        create: expect.objectContaining({
          githubInstallationId: BigInt(12345),
          accountLogin: 'octocat',
          accountType: 'User',
          plan: 'INDIE',
          marketplacePlanId: BigInt(999),
          marketplacePlanName: 'Indie Plan',
          marketplaceStatus: 'ACTIVE',
          billingCycle: 'monthly',
        }),
      });
    });

    it('updates installation on "changed" to TEAM plan with 5 seats', async () => {
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

    it('handles "pending_change" event by updating status and billing date', async () => {
      (prisma.installation.updateMany as any).mockResolvedValueOnce({ count: 1 });

      const result = await MarketplaceService.handleMarketplaceEvent(
        createPayload('pending_change', 'Team Plan')
      );

      expect(result.status).toBe('PENDING_CHANGE');
      expect(prisma.installation.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { githubInstallationId: BigInt(12345) },
          data: expect.objectContaining({
            marketplaceStatus: 'PENDING_CHANGE',
          }),
        })
      );
    });

    it('handles unexpected action by returning IGNORED status', async () => {
      const result = await MarketplaceService.handleMarketplaceEvent(
        createPayload('unknown_action' as any, 'Indie Plan')
      );

      expect(result.status).toBe('IGNORED');
      expect(result.plan).toBe('INDIE');
    });
  });

  describe('getUserBillingOverview — edge cases', () => {
    it('handles user with zero installations gracefully (defaults to FREE plan)', async () => {
      (prisma.installation.findMany as any).mockResolvedValueOnce([]);

      const overview = await MarketplaceService.getUserBillingOverview('user-no-inst');

      expect(overview.plan).toBe('FREE');
      expect(overview.usage.publicReviewsUsed).toBe(0);
      expect(overview.usage.privateReviewsUsed).toBe(0);
      expect(overview.usage.privateReviewLimit).toBe(50);
      expect(overview.usage.privateReviewsRemaining).toBe(50);
      expect(overview.usage.isLimitReached).toBe(false);
      expect(overview.availablePlans).toEqual(AVAILABLE_PLANS);
    });

    it('calculates metrics when user is on paid INDIE plan (unlimited private reviews)', async () => {
      (prisma.installation.findMany as any).mockResolvedValueOnce([
        {
          id: 'inst-paid',
          plan: 'INDIE',
          billingCycle: 'yearly',
          marketplaceStatus: 'ACTIVE',
          nextBillingDate: new Date('2027-01-01'),
          repositories: [{ id: 'r1', isPrivate: true }],
        },
      ]);

      (prisma.usageLedger.upsert as any).mockResolvedValueOnce({
        publicReviewsCount: 100,
        privateReviewsCount: 350,
      });

      const overview = await MarketplaceService.getUserBillingOverview('user-indie');

      expect(overview.plan).toBe('INDIE');
      expect(overview.billingCycle).toBe('yearly');
      expect(overview.usage.privateReviewsUsed).toBe(350);
      expect(overview.usage.privateReviewLimit).toBeNull();
      expect(overview.usage.privateReviewsRemaining).toBeNull();
      expect(overview.usage.isLimitReached).toBe(false);
    });

    it('flags isLimitReached when user on FREE plan hits 50 reviews', async () => {
      (prisma.installation.findMany as any).mockResolvedValueOnce([
        {
          id: 'inst-free',
          plan: 'FREE',
          billingCycle: 'monthly',
          marketplaceStatus: 'ACTIVE',
          nextBillingDate: null,
          repositories: [],
        },
      ]);

      (prisma.usageLedger.upsert as any).mockResolvedValueOnce({
        publicReviewsCount: 10,
        privateReviewsCount: 50,
      });

      const overview = await MarketplaceService.getUserBillingOverview('user-capped');

      expect(overview.plan).toBe('FREE');
      expect(overview.usage.privateReviewsUsed).toBe(50);
      expect(overview.usage.privateReviewsRemaining).toBe(0);
      expect(overview.usage.isLimitReached).toBe(true);
    });
  });
});
