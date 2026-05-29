import { Router } from 'express';
import authRoutes from './auth.routes';
import productRoutes from './product.routes';
import supplierRoutes from './supplier.routes';
import orderRoutes from './order.routes';
import deliveryRoutes from './delivery.routes';
import dashboardRoutes from './dashboard.routes';
import assistantRoutes from './assistant.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/suppliers', supplierRoutes);
router.use('/orders', orderRoutes);
router.use('/deliveries', deliveryRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/assistant', assistantRoutes);

export default router;
