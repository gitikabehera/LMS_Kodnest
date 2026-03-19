import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import * as ctrl from './videos.controller';

const router = Router();
router.get('/:id', authenticate, ctrl.getVideo);
export default router;
