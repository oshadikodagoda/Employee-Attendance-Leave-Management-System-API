const { Sequelize } = require('sequelize');
const config = require('../config/config.json')['development'];

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    dialect: config.dialect
  }
);

const Department = require('./department')(sequelize);
const Employee = require('./employee')(sequelize);
const LeaveRequest = require('./leaveRequest')(sequelize);
const AttendanceLog = require('./attendanceLog')(sequelize);

// --- Relationships / Foreign Keys ---

// Department -> Employees (One-to-Many)
Department.hasMany(Employee, { foreignKey: 'department_id' });
Employee.belongsTo(Department, { foreignKey: 'department_id' });

// Employee -> LeaveRequests (One-to-Many)
Employee.hasMany(LeaveRequest, { foreignKey: 'employee_id' });
LeaveRequest.belongsTo(Employee, { foreignKey: 'employee_id' });

// Employee -> AttendanceLogs (One-to-Many)
Employee.hasMany(AttendanceLog, { foreignKey: 'employee_id' });
AttendanceLog.belongsTo(Employee, { foreignKey: 'employee_id' });

module.exports = {
  sequelize,
  Department,
  Employee,
  LeaveRequest,
  AttendanceLog
};