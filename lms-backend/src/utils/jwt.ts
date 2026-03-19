import jwt from 'jsonwebtoken';
import crypto from 'crypto';

export function signAccessToken(userId: number): string {
  return jwt.sign(
    { sub: userId },
    process.env.JWT_ACCESS_SECRET!,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m' }
  );
}

export function signRefreshToken(userId: number): string {
  return jwt.sign(
    { sub: userId },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: `${process.env.JWT_REFRESH_EXPIRES_DAYS || 30}d` }
  );
}

export function verifyRefreshToken(token: string): { sub: number } {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as { sub: number };
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function refreshTokenExpiresAt(): Date {
  const days = Number(process.env.JWT_REFRESH_EXPIRES_DAYS || 30);
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}
