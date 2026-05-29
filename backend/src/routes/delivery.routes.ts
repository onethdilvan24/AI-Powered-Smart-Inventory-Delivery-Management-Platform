import { Router } from 'express';
import {
  listDeliveries, getDelivery,
  createDelivery, updateDelivery,
  updatePosition, updateDeliveryStatus, deleteDelivery,
} from '../controllers/delivery.controller';
import { authenticate, requireRole } from '../middleware/auth';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);

router.get('/', listDeliveries);
router.get('/:id', getDelivery);
router.post('/', requireRole(Role.ADMIN, Role.MANAGER), createDelivery);
router.put('/:id', requireRole(Role.ADMIN, Role.MANAGER), updateDelivery);
router.patch('/:id/position', requireRole(Role.ADMIN, Role.MANAGER, Role.DRIVER), updatePosition);
router.patch('/:id/status', requireRole(Role.ADMIN, Role.MANAGER, Role.DRIVER), updateDeliveryStatus);
router.delete('/:id', requireRole(Role.ADMIN), deleteDelivery);

export default router;
