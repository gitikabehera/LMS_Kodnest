import { Router, Request, Response, NextFunction } from 'express';
import * as ctrl from './progress.controller';
import { AuthRequest } from '../../middleware/authenticate';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const authMiddleware = require('../../middleware/auth.middleware');

// Bridge: auth.middleware.js sets req.user.id — map it to req.userId for the TS controller
function bridge(req: Request, _res: Response, next: NextFunction) {
  const r = req as AuthRequest & { user?: { id: number } };
  if (r.user?.id) r.userId = r.user.id;
  next();
}

const router = Router();
router.use(authMiddleware, bridge);
router.get('/videos/:id',  ctrl.getProgress);
router.post('/videos/:id', ctrl.updateProgress);
export default router;
