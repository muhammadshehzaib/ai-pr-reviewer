import { Router } from 'express';
import { VaultController } from '../controllers/vault.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

router.use(requireAuth);
router.get('/', VaultController.getVault);
router.put('/', VaultController.upsertVault);
router.delete('/', VaultController.deleteVault);

export default router;
