const { AttendanceLog } = require('../models');

// 1. Clock In
exports.clockIn = async (req, res) => {
  try {
    const employee_id = req.user.id;

    // Check if user already clocked in today without clocking out
    const activeLog = await AttendanceLog.findOne({
      where: { employee_id, clock_out: null }
    });

    if (activeLog) {
      return res.status(400).json({ message: "You are already clocked in." });
    }

    const newLog = await AttendanceLog.create({
      employee_id,
      clock_in: new Date()
    });

    res.status(201).json({ message: "Clocked in successfully!", log: newLog });
  } catch (error) {
    res.status(500).json({ message: "Error clocking in.", error: error.message });
  }
};

// 2. Clock Out
exports.clockOut = async (req, res) => {
  try {
    const employee_id = req.user.id;

    // Find latest active clock-in
    const activeLog = await AttendanceLog.findOne({
      where: { employee_id, clock_out: null }
    });

    if (!activeLog) {
      return res.status(400).json({ message: "No active clock-in session found." });
    }

    const clockOutTime = new Date();
    const clockInTime = new Date(activeLog.clock_in);

    // Calculate worked hours
    const totalHours = ((clockOutTime - clockInTime) / (1000 * 60 * 60)).toFixed(2);

    activeLog.clock_out = clockOutTime;
    activeLog.total_hours = parseFloat(totalHours);
    await activeLog.save();

    res.json({ message: "Clocked out successfully!", total_hours: activeLog.total_hours, log: activeLog });
  } catch (error) {
    res.status(500).json({ message: "Error clocking out.", error: error.message });
  }
};

// 3. Get User Attendance History
exports.getHistory = async (req, res) => {
  try {
    const logs = await AttendanceLog.findAll({
      where: { employee_id: req.user.id },
      order: [['createdAt', 'DESC']]
    });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: "Error fetching attendance logs.", error: error.message });
  }
};