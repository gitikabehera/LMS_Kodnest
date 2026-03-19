import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../../middleware/authenticate';
import * as svc from './progress.service';

const updateSchema = z.object({
  last_position_seconds: z.number().int().min(0),
  is_completed: z.boolean(),
});

export async function getProgress(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    res.json(await svc.getProgress(Number(req.params.id), req.userId!));
  } catch (err) { next(err); }
}

export async function updateProgress(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const body = updateSchema.parse(req.body);
    const result = await svc.upsertProgress(
      Number(req.params.id),
      req.userId!,
      body.last_position_seconds,
      body.is_completed
    );
    res.json(result);
  } catch (err) { next(err); }
}
