const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveController');
const { verifyToken, isManager } = require('../middleware/authMiddleware');

// Employee Routes
router.post('/apply', verifyToken, leaveController.applyLeave);
router.get('/my-requests', verifyToken, leaveController.getMyLeaveRequests);

// Manager Routes (Protected by isManager middleware)
router.get('/pending', verifyToken, isManager, leaveController.getPendingRequests);
router.patch('/respond/:id', verifyToken, isManager, leaveController.respondToLeaveRequest);

module.exports = router;