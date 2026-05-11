import { Router } from 'express';
import { RepositoryController } from '../controllers/repository.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

router.use(requireAuth);
router.get('/', RepositoryController.list);
router.post('/', RepositoryController.register);
router.delete('/:id', RepositoryController.deactivate);
router.post('/:id/analyze', RepositoryController.triggerAnalysis);

export default router;
