import { Request, Response } from 'express';
import { MarketplaceService, AVAILABLE_PLANS } from '../services/marketplace.service';

export class BillingController {
  /**
   * GET /api/billing/usage
   * Returns authenticated user's current subscription plan, review usage, and limits.
   */
  static async getUsage(req: Request, res: Response) {
    try {
      const userId = req.auth!.userId;
      const billingOverview = await MarketplaceService.getUserBillingOverview(userId);
      return res.json(billingOverview);
    } catch (err: any) {
      console.error('Failed to retrieve user billing overview:', err);
      return res.status(500).json({ error: 'Failed to retrieve billing overview' });
    }
  }

  /**
   * GET /api/billing/plans
   * Returns list of available subscription tiers and feature comparison.
   */
  static async getPlans(_req: Request, res: Response) {
    return res.json({
      plans: AVAILABLE_PLANS,
      marketplaceUrl: 'https://github.com/marketplace/ai-pr-reviewer',
    });
  }
}
