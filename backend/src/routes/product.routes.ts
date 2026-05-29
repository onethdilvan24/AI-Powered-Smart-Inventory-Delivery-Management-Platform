import { Router } from 'express';
import {
  listProducts, getProduct, getLowStock,
  createProduct, updateProduct, deleteProduct,
} from '../controllers/product.controller';
import { authenticate, requireRole } from '../middleware/auth';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);

router.get('/', listProducts);
router.get('/low-stock', getLowStock);
router.get('/:id', getProduct);
router.post('/', requireRole(Role.ADMIN, Role.MANAGER), createProduct);
router.put('/:id', requireRole(Role.ADMIN, Role.MANAGER), updateProduct);
router.delete('/:id', requireRole(Role.ADMIN), deleteProduct);

export default router;
