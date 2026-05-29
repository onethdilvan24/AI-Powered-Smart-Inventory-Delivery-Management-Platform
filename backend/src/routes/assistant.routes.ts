import { Router } from 'express';
import { query } from '../controllers/assistant.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/query', authenticate, query);

export default router;
