const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Employee = sequelize.define('Employee', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role: {
      type: DataTypes.ENUM('Employee', 'Manager', 'Admin'),
      defaultValue: 'Employee'
    },
    pto_balance: {
      type: DataTypes.INTEGER,
      defaultValue: 20 // Standard initial PTO days balance
    }
  }, {
    timestamps: true
  });

  return Employee;
};