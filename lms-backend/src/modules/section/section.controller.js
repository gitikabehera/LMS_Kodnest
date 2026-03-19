const sectionService = require('./section.service');

/**
 * GET /api/section/:subjectId
 * Returns all sections for a subject, ordered by order_index.
 */
async function getSectionsBySubject(req, res) {
  try {
    const subjectId = parseInt(req.params.subjectId, 10);
    if (isNaN(subjectId)) {
      return res.status(400).json({ success: false, message: 'Invalid subject ID.' });
    }

    const sections = await sectionService.getSectionsBySubject(subjectId);
    return res.status(200).json({
      success:    true,
      subject_id: subjectId,
      count:      sections.length,
      data:       sections,
    });
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Failed to fetch sections.',
    });
  }
}

module.exports = { getSectionsBySubject };
