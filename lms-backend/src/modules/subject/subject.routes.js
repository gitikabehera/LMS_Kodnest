'use strict';
const { Router } = require('express');
const authMiddleware = require('../../middleware/auth.middleware');
const { getAllSubjects, getSubjectById, enroll, getAwards } = require('./subject.controller');

const router = Router();
router.use(authMiddleware);

router.get('/awards',  getAwards);       // GET  /api/subject/awards
router.post('/enroll', enroll);          // POST /api/subject/enroll
router.get('/',        getAllSubjects);  // GET  /api/subject
router.get('/:id',     getSubjectById); // GET  /api/subject/:id

module.exports = router;
