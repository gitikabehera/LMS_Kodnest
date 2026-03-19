const { Router } = require('express');
const authMiddleware = require('../../middleware/auth.middleware');
const { getSectionsBySubject } = require('./section.controller');

const router = Router();

router.use(authMiddleware);

// GET /api/section/:subjectId
router.get('/:subjectId', getSectionsBySubject);

module.exports = router;
