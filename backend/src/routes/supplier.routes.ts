import { Router } from 'express';
import {
  listSuppliers, getSupplier,
  createSupplier, updateSupplier, deleteSupplier,
} from '../controllers/supplier.controller';
import { authenticate, requireRole } from '../middleware/auth';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);

router.get('/', listSuppliers);
router.get('/:id', getSupplier);
router.post('/', requireRole(Role.ADMIN, Role.MANAGER), createSupplier);
router.put('/:id', requireRole(Role.ADMIN, Role.MANAGER), updateSupplier);
router.delete('/:id', requireRole(Role.ADMIN), deleteSupplier);

export default router;
