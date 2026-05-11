import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

router.get('/github', AuthController.startGitHubLogin);
router.get('/github/callback', AuthController.handleGitHubCallback);
router.get('/me', requireAuth, AuthController.getMe);
router.post('/logout', AuthController.logout);

export default router;
