import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

import { errorHandler } from './middleware/errorHandler';
import authRoutes from './modules/auth/auth.routes';
// JS auth module (register / login / me with JWT_SECRET)
// eslint-disable-next-line @typescript-eslint/no-var-requires
const jsAuthRoutes = require('./modules/auth/auth.routes.js');

// JS LMS modules (subject / section / video)
// eslint-disable-next-line @typescript-eslint/no-var-requires
const jsSubjectRoutes = require('./modules/subject/subject.routes.js');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const jsSectionRoutes = require('./modules/section/section.routes.js');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const jsVideoRoutes   = require('./modules/video/video.routes.js');

import subjectRoutes from './modules/subjects/subjects.routes';
import videoRoutes from './modules/videos/videos.routes';
import progressRoutes from './modules/progress/progress.routes';
import healthRoutes from './modules/health/health.routes';

const app = express();

// ── Security ────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    // Allow any localhost port in development
    if (/^http:\/\/localhost:\d+$/.test(origin)) return callback(null, true);
    // Allow any Vercel deployment
    if (/^https:\/\/.*\.vercel\.app$/.test(origin)) return callback(null, true);
    // Allow explicitly configured frontend URL
    const allowed = process.env.FRONTEND_URL;
    if (allowed && origin === allowed) return callback(null, true);
    callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
}));

// ── Rate limiting ────────────────────────────────────────────
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: 'Too many requests' }));

// ── Body / Cookie parsing ────────────────────────────────────
app.use(express.json());
app.use(cookieParser());

// ── Routes ───────────────────────────────────────────────────
app.use('/api/auth',     jsAuthRoutes); // JS auth (register / login / me — JWT_SECRET) — FIRST
app.use('/api/auth',     authRoutes);   // TS auth (refresh token / cookie flow)
app.use('/api/subjects', subjectRoutes);
app.use('/api/videos',   videoRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/health',   healthRoutes);

// ── JS LMS routes ─────────────────────────────────────────────
app.use('/api/subject',  jsSubjectRoutes); // GET /api/subject, /api/subject/:id, POST /api/subject/enroll
app.use('/api/section',  jsSectionRoutes);
app.use('/api/video',    jsVideoRoutes);

// Standalone enroll alias: POST /api/enroll { subject_id }
// eslint-disable-next-line @typescript-eslint/no-var-requires
const authMiddleware = require('./middleware/auth.middleware');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { enroll: enrollCtrl, getAwards: awardCtrl } = require('./modules/subject/subject.controller');
app.post('/api/enroll',  authMiddleware, enrollCtrl);
app.get('/api/awards',   authMiddleware, awardCtrl);

// ── Error handler (must be last) ─────────────────────────────
app.use(errorHandler);

export default app;
