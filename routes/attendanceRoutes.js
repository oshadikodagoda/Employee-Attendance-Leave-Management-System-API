const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { verifyToken } = require('../middleware/authMiddleware');

// All attendance routes require valid JWT authentication
router.post('/clock-in', verifyToken, attendanceController.clockIn);
router.post('/clock-out', verifyToken, attendanceController.clockOut);
router.get('/history', verifyToken, attendanceController.getHistory);

module.exports = router;