import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/authenticate';
import * as svc from './videos.service';

export async function getVideo(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    res.json(await svc.getVideoById(Number(req.params.id), req.userId!));
  } catch (err) { next(err); }
}
