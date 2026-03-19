import { Request, Response, NextFunction } from 'express';
import * as svc from './videos.service';

interface AuthRequest extends Request {
  userId?: number;
}

export async function getVideo(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    res.json(await svc.getVideoById(Number(req.params['id']), req.userId!));
  } catch (err) { next(err); }
}
