const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const AttendanceLog = sequelize.define('AttendanceLog', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    clock_in: {
      type: DataTypes.DATE,
      allowNull: false
    },
    clock_out: {
      type: DataTypes.DATE,
      allowNull: true
    },
    total_hours: {
      type: DataTypes.FLOAT,
      defaultValue: 0.0
    }
  }, {
    timestamps: true
  });

  return AttendanceLog;
};