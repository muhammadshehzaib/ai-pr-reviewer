import { Router } from 'express';
import { BillingController } from '../controllers/billing.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

// Public: view plan tiers and feature comparisons
router.get('/plans', BillingController.getPlans);

// Protected: view authenticated user's active plan and monthly review usage
router.get('/usage', requireAuth, BillingController.getUsage);

export default router;
