import pool from '../../config/db';
import { AppError } from '../../middleware/errorHandler';
import { RowDataPacket } from 'mysql2';

export async function getProgress(videoId: number, userId: number) {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT last_position_seconds, is_completed, watched_at
     FROM video_progress WHERE user_id = ? AND video_id = ?`,
    [userId, videoId]
  );
  return rows[0] ?? { last_position_seconds: 0, is_completed: false };
}

export async function upsertProgress(
  videoId: number,
  userId: number,
  lastPositionSeconds: number,
  isCompleted: boolean
) {
  const [vRows] = await pool.query<RowDataPacket[]>(
    'SELECT id FROM videos WHERE id = ?', [videoId]
  );
  if (!vRows.length) throw new AppError(404, 'Video not found');

  await pool.query(
    `INSERT INTO video_progress (user_id, video_id, last_position_seconds, is_completed)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       last_position_seconds = VALUES(last_position_seconds),
       is_completed = IF(is_completed = 1, 1, VALUES(is_completed)),
       watched_at = NOW()`,
    [userId, videoId, lastPositionSeconds, isCompleted ? 1 : 0]
  );

  return getProgress(videoId, userId);
}
