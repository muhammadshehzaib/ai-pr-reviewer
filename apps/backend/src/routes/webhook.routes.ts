import { Router } from 'express';
import { WebhookController } from '../controllers/webhook.controller';
import { verifyGitHubWebhook } from '../middlewares/github-verify.middleware';

const router = Router();

// POST /api/webhooks/github
// We apply our security middleware first to guarantee sender authenticity.
router.post('/github', verifyGitHubWebhook, WebhookController.handleGitHubEvent);

export default router;
