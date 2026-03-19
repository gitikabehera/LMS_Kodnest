import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as authService from './auth.service';
import { AppError } from '../../middleware/errorHandler';

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: Number(process.env.JWT_REFRESH_EXPIRES_DAYS || 30) * 24 * 60 * 60 * 1000,
  path: '/api/auth',
};

const registerSchema = z.object({
  name:     z.string().min(2).max(150),
  email:    z.string().email(),
  password: z.string().min(8),
});

const loginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(1),
});

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const body = registerSchema.parse(req.body);
    const user = await authService.register(body.name, body.email, body.password);
    res.status(201).json({ message: 'Registered successfully', user });
  } catch (err) { next(err); }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const body = loginSchema.parse(req.body);
    const { accessToken, refreshToken, user } = await authService.login(body.email, body.password);
    res.cookie('refreshToken', refreshToken, COOKIE_OPTS);
    res.json({ accessToken, user });
  } catch (err) { next(err); }
}

export async function refreshToken(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) throw new AppError(401, 'No refresh token provided');
    const { accessToken, refreshToken: newRefresh } = await authService.refresh(token);
    res.cookie('refreshToken', newRefresh, COOKIE_OPTS);
    res.json({ accessToken });
  } catch (err) { next(err); }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.refreshToken;
    if (token) await authService.logout(token);
    res.clearCookie('refreshToken', { path: '/api/auth' });
    res.json({ message: 'Logged out' });
  } catch (err) { next(err); }
}
