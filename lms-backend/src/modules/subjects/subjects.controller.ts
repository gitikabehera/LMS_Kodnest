import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/authenticate';
import * as svc from './subjects.service';

export async function list(_req: AuthRequest, res: Response, next: NextFunction) {
  try {
    res.json(await svc.getAllSubjects());
  } catch (err) { next(err); }
}

export async function getOne(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    res.json(await svc.getSubjectById(Number(req.params.id)));
  } catch (err) { next(err); }
}

export async function getTree(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    res.json(await svc.getSubjectTree(Number(req.params.id), req.userId));
  } catch (err) { next(err); }
}
