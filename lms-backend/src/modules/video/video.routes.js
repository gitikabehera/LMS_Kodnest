const { Router } = require('express');
const authMiddleware = require('../../middleware/auth.middleware');
const { getVideosBySection } = require('./video.controller');

const router = Router();

router.use(authMiddleware);

// GET /api/video/:sectionId
router.get('/:sectionId', getVideosBySection);

module.exports = router;
