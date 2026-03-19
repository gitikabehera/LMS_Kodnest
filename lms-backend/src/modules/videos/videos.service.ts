import pool from '../../config/db';
import { AppError } from '../../middleware/errorHandler';
import { RowDataPacket } from 'mysql2';

export async function getVideoById(videoId: number, userId: number) {
  // Fetch current video with section info
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT v.id, v.title, v.description, v.youtube_url, v.order_index,
            v.duration_seconds, v.section_id, s.subject_id, s.order_index AS section_order
     FROM videos v
     JOIN sections s ON s.id = v.section_id
     WHERE v.id = ?`,
    [videoId]
  );
  if (!rows.length) throw new AppError(404, 'Video not found');
  const video = rows[0];

  // Check enrollment
  const [enrolled] = await pool.query<RowDataPacket[]>(
    'SELECT id FROM enrollments WHERE user_id = ? AND subject_id = ?',
    [userId, video.subject_id]
  );
  if (!enrolled.length) throw new AppError(403, 'Not enrolled in this subject');

  // Determine previous video (within section or across sections)
  const [prevRows] = await pool.query<RowDataPacket[]>(
    `SELECT v2.id FROM videos v2
     JOIN sections s2 ON s2.id = v2.section_id
     WHERE s2.subject_id = ?
       AND (
         (v2.section_id = ? AND v2.order_index = ?)
         OR
         (s2.order_index = ? AND v2.order_index = (
           SELECT MAX(v3.order_index) FROM videos v3 WHERE v3.section_id = v2.section_id
         ))
       )
     ORDER BY s2.order_index DESC, v2.order_index DESC
     LIMIT 1`,
    [
      video.subject_id,
      video.section_id, video.order_index - 1,
      video.section_order - 1,
    ]
  );
  const previousVideoId: number | null = prevRows[0]?.id ?? null;

  // Determine next video
  const [nextRows] = await pool.query<RowDataPacket[]>(
    `SELECT v2.id FROM videos v2
     JOIN sections s2 ON s2.id = v2.section_id
     WHERE s2.subject_id = ?
       AND (
         (v2.section_id = ? AND v2.order_index = ?)
         OR
         (s2.order_index = ? AND v2.order_index = 1)
       )
     ORDER BY s2.order_index ASC, v2.order_index ASC
     LIMIT 1`,
    [
      video.subject_id,
      video.section_id, video.order_index + 1,
      video.section_order + 1,
    ]
  );
  const nextVideoId: number | null = nextRows[0]?.id ?? null;

  // Is this video locked?
  let isLocked = false;
  if (previousVideoId) {
    const [prog] = await pool.query<RowDataPacket[]>(
      'SELECT is_completed FROM video_progress WHERE user_id = ? AND video_id = ?',
      [userId, previousVideoId]
    );
    isLocked = !prog[0]?.is_completed;
  }

  // User's own progress on this video
  const [progRows] = await pool.query<RowDataPacket[]>(
    'SELECT last_position_seconds, is_completed, completed_at FROM video_progress WHERE user_id = ? AND video_id = ?',
    [userId, videoId]
  );
  const progress = progRows[0] ?? { last_position_seconds: 0, is_completed: false, completed_at: null };

  return {
    ...video,
    is_locked: isLocked,
    previous_video_id: previousVideoId,
    next_video_id: nextVideoId,
    progress,
  };
}
