import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import * as ctrl from './subjects.controller';

const router = Router();

router.get('/',           ctrl.list);
router.get('/:id',        ctrl.getOne);
router.get('/:id/tree',   authenticate, ctrl.getTree);

export default router;
