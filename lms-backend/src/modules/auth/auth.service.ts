import bcrypt from 'bcryptjs';
import pool from '../../config/db';
import { AppError } from '../../middleware/errorHandler';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  hashToken,
  refreshTokenExpiresAt,
} from '../../utils/jwt';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

interface UserRow extends RowDataPacket {
  id: number;
  email: string;
  password_hash: string;
  name: string;
}

export async function register(name: string, email: string, password: string) {
  const [existing] = await pool.query<UserRow[]>(
    'SELECT id FROM users WHERE email = ?', [email]
  );
  if (existing.length) throw new AppError(409, 'Email already registered');

  const hash = await bcrypt.hash(password, 12);
  const [result] = await pool.query<ResultSetHeader>(
    'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
    [name, email, hash]
  );
  return { id: result.insertId, name, email };
}

export async function login(email: string, password: string) {
  const [rows] = await pool.query<UserRow[]>(
    'SELECT id, email, name, password_hash FROM users WHERE email = ?', [email]
  );
  const user = rows[0];
  if (!user) throw new AppError(401, 'Invalid credentials');

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) throw new AppError(401, 'Invalid credentials');

  const accessToken  = signAccessToken(user.id);
  const refreshToken = signRefreshToken(user.id);

  await pool.query(
    'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)',
    [user.id, hashToken(refreshToken), refreshTokenExpiresAt()]
  );

  return { accessToken, refreshToken, user: { id: user.id, name: user.name, email: user.email } };
}

export async function refresh(token: string) {
  let payload: { sub: number };
  try {
    payload = verifyRefreshToken(token);
  } catch {
    throw new AppError(401, 'Invalid or expired refresh token');
  }

  const tokenHash = hashToken(token);
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT id FROM refresh_tokens
     WHERE user_id = ? AND token_hash = ? AND revoked_at IS NULL AND expires_at > NOW()`,
    [payload.sub, tokenHash]
  );
  if (!rows.length) throw new AppError(401, 'Refresh token revoked or expired');

  // Rotate: revoke old, issue new
  await pool.query('UPDATE refresh_tokens SET revoked_at = NOW() WHERE token_hash = ?', [tokenHash]);

  const newRefresh = signRefreshToken(payload.sub);
  await pool.query(
    'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)',
    [payload.sub, hashToken(newRefresh), refreshTokenExpiresAt()]
  );

  return { accessToken: signAccessToken(payload.sub), refreshToken: newRefresh };
}

export async function logout(token: string) {
  await pool.query(
    'UPDATE refresh_tokens SET revoked_at = NOW() WHERE token_hash = ?',
    [hashToken(token)]
  );
}
