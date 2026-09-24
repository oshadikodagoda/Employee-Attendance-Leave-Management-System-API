const { LeaveRequest, Employee, sequelize } = require('../models');

// 1. Employee applies for leave
exports.applyLeave = async (req, res) => {
  try {
    const employee_id = req.user.id;
    const { leave_type, start_date, end_date, reason } = req.body;

    // Calculate requested leave days
    const start = new Date(start_date);
    const end = new Date(end_date);
    const timeDiff = end.getTime() - start.getTime();
    const daysRequested = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;

    if (daysRequested <= 0) {
      return res.status(400).json({ message: "Invalid date range." });
    }

    // Check employee's current PTO balance
    const employee = await Employee.findByPk(employee_id);
    if (employee.pto_balance < daysRequested) {
      return res.status(400).json({ 
        message: `Insufficient PTO balance. Remaining balance: ${employee.pto_balance} days.` 
      });
    }

    // Create leave request
    const newLeave = await LeaveRequest.create({
      employee_id,
      leave_type,
      start_date,
      end_date,
      reason,
      status: 'Pending'
    });

    res.status(201).json({ 
      message: "Leave request submitted successfully!", 
      leave: newLeave,
      requested_days: daysRequested 
    });
  } catch (error) {
    res.status(500).json({ message: "Error submitting leave request.", error: error.message });
  }
};

// 2. Employee views their leave request history
exports.getMyLeaveRequests = async (req, res) => {
  try {
    const leaves = await LeaveRequest.findAll({
      where: { employee_id: req.user.id },
      order: [['createdAt', 'DESC']]
    });
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: "Error fetching leave history.", error: error.message });
  }
};

// 3. Manager views all pending leave requests across employees
exports.getPendingRequests = async (req, res) => {
  try {
    const pendingLeaves = await LeaveRequest.findAll({
      where: { status: 'Pending' },
      include: [{ model: Employee, attributes: ['id', 'name', 'email', 'pto_balance'] }],
      order: [['createdAt', 'ASC']]
    });
    res.json(pendingLeaves);
  } catch (error) {
    res.status(500).json({ message: "Error fetching pending requests.", error: error.message });
  }
};

// 4. Manager Approves or Rejects Leave Request (Database Transaction)
exports.respondToLeaveRequest = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params; // Leave request ID
    const { action } = req.body; // 'Approved' or 'Rejected'

    if (!['Approved', 'Rejected'].includes(action)) {
      return res.status(400).json({ message: "Action must be either 'Approved' or 'Rejected'." });
    }

    const leaveRequest = await LeaveRequest.findByPk(id, { transaction });
    if (!leaveRequest) {
      await transaction.rollback();
      return res.status(404).json({ message: "Leave request not found." });
    }

    if (leaveRequest.status !== 'Pending') {
      await transaction.rollback();
      return res.status(400).json({ message: `Request is already ${leaveRequest.status}.` });
    }

    if (action === 'Approved') {
      // Calculate leave days to deduct
      const start = new Date(leaveRequest.start_date);
      const end = new Date(leaveRequest.end_date);
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) + 1;

      // Find employee and check balance
      const employee = await Employee.findByPk(leaveRequest.employee_id, { transaction });
      if (employee.pto_balance < days) {
        await transaction.rollback();
        return res.status(400).json({ message: "Employee no longer has enough PTO balance." });
      }

      // Deduct balance and update status
      employee.pto_balance -= days;
      await employee.save({ transaction });
    }

    leaveRequest.status = action;
    await leaveRequest.save({ transaction });

    await transaction.commit();
    res.json({ message: `Leave request has been ${action}.`, leave: leaveRequest });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ message: "Error processing leave request.", error: error.message });
  }
};