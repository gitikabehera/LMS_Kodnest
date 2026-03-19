const videoService = require('./video.service');

/**
 * GET /api/video/:sectionId
 * Returns all videos for a section, ordered by order_index.
 */
async function getVideosBySection(req, res) {
  try {
    const sectionId = parseInt(req.params.sectionId, 10);
    if (isNaN(sectionId)) {
      return res.status(400).json({ success: false, message: 'Invalid section ID.' });
    }

    const result = await videoService.getVideosBySection(sectionId);
    return res.status(200).json({
      success: true,
      count:   result.videos.length,
      data:    result,
    });
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Failed to fetch videos.',
    });
  }
}

module.exports = { getVideosBySection };
