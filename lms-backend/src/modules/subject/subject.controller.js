'use strict';
const subjectService = require('./subject.service');

async function getAllSubjects(req, res) {
  try {
    const subjects = await subjectService.getAllSubjects(req.user.id);
    return res.status(200).json({ success: true, count: subjects.length, data: subjects });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
}

async function getSubjectById(req, res) {
  try {
    const subjectId = parseInt(req.params.id, 10);
    if (isNaN(subjectId)) return res.status(400).json({ success: false, message: 'Invalid subject ID.' });
    const subject = await subjectService.getSubjectWithTree(subjectId, req.user.id);
    return res.status(200).json({ success: true, data: subject });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
}

async function enroll(req, res) {
  try {
    const subjectId = parseInt(req.body.subject_id, 10);
    if (isNaN(subjectId)) return res.status(400).json({ success: false, message: 'Invalid subject_id.' });
    const result = await subjectService.enrollUser(req.user.id, subjectId);
    return res.status(200).json({ success: true, enrolled: true, data: result });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
}

async function getAwards(req, res) {
  try {
    const awards = await subjectService.getAwards(req.user.id);
    return res.status(200).json({ success: true, data: awards });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
}

module.exports = { getAllSubjects, getSubjectById, enroll, getAwards };
