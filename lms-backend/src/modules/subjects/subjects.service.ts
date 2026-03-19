import pool from '../../config/db';
import { AppError } from '../../middleware/errorHandler';
import { RowDataPacket } from 'mysql2';

export async function getAllSubjects() {
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT id, title, slug, description FROM subjects WHERE is_published = 1 ORDER BY title'
  );
  return rows;
}

export async function getSubjectById(id: number) {
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT id, title, slug, description FROM subjects WHERE id = ? AND is_published = 1',
    [id]
  );
  if (!rows.length) throw new AppError(404, 'Subject not found');
  return rows[0];
}

/**
 * Returns full subject tree: subject → sections → videos
 * Also attaches progress for the requesting user if userId is provided.
 */
export async function getSubjectTree(subjectId: number, userId?: number) {
  const subject = await getSubjectById(subjectId);

  const [sections] = await pool.query<RowDataPacket[]>(
    'SELECT id, title, order_index FROM sections WHERE subject_id = ? ORDER BY order_index',
    [subjectId]
  );

  // Fetch all videos for this subject in one query
  const [videos] = await pool.query<RowDataPacket[]>(
    `SELECT v.id, v.section_id, v.title, v.order_index, v.duration_seconds
     FROM videos v
     JOIN sections s ON s.id = v.section_id
     WHERE s.subject_id = ?
     ORDER BY s.order_index, v.order_index`,
    [subjectId]
  );

  // Fetch progress for user
  let progressMap: Record<number, boolean> = {};
  if (userId) {
    const [progress] = await pool.query<RowDataPacket[]>(
      `SELECT vp.video_id, vp.is_completed
       FROM video_progress vp
       JOIN videos v ON v.id = vp.video_id
       JOIN sections s ON s.id = v.section_id
       WHERE s.subject_id = ? AND vp.user_id = ?`,
      [subjectId, userId]
    );
    progressMap = Object.fromEntries(progress.map((p) => [p.video_id, !!p.is_completed]));
  }

  // Build ordered flat list to compute locked state
  const orderedVideos = videos as Array<{
    id: number; section_id: number; title: string;
    order_index: number; duration_seconds: number | null;
  }>;

  const tree = sections.map((sec) => {
    const sectionVideos = orderedVideos.filter((v) => v.section_id === sec.id);
    return {
      ...sec,
      videos: sectionVideos.map((v, idx) => {
        // First video of first section is always unlocked
        const isFirst = sec.order_index === 1 && idx === 0 &&
          (sections[0] as RowDataPacket).id === sec.id;
        const prevVideo = idx > 0 ? sectionVideos[idx - 1] : null;
        const isLocked = !isFirst && prevVideo
          ? !progressMap[prevVideo.id]
          : !isFirst;

        return {
          ...v,
          is_completed: progressMap[v.id] ?? false,
          is_locked: userId ? isLocked : true,
        };
      }),
    };
  });

  return { ...subject, sections: tree };
}
