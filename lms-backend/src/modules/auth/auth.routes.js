const { Router } = require('express');
const { register, login, getMe, updateProfile, getDashboard } = require('./auth.controller');
const authMiddleware = require('../../middleware/auth.middleware');

const router = Router();

router.post('/register', register);
router.post('/login',    login);
router.get('/me',        authMiddleware, getMe);
router.put('/profile',   authMiddleware, updateProfile);
router.get('/dashboard', authMiddleware, getDashboard);

module.exports = router;
