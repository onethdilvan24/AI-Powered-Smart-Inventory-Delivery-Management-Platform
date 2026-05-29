import { Router } from 'express';
import {
  listOrders, getOrder,
  createOrder, updateOrder, updateOrderStatus, deleteOrder,
} from '../controllers/order.controller';
import { authenticate, requireRole } from '../middleware/auth';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);

router.get('/', listOrders);
router.get('/:id', getOrder);
router.post('/', requireRole(Role.ADMIN, Role.MANAGER), createOrder);
router.put('/:id', requireRole(Role.ADMIN, Role.MANAGER), updateOrder);
router.patch('/:id/status', requireRole(Role.ADMIN, Role.MANAGER, Role.DRIVER), updateOrderStatus);
router.delete('/:id', requireRole(Role.ADMIN), deleteOrder);

export default router;
