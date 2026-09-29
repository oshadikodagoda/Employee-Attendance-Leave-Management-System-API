const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Employee, Department } = require('../models');

// 1. Register New Employee / Manager
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, department_id } = req.body;

    // Check if email already exists
    const existingUser = await Employee.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email is already registered." });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new employee
    const newEmployee = await Employee.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'Employee',
      department_id
    });

    res.status(201).json({
      message: "User registered successfully!",
      user: {
        id: newEmployee.id,
        name: newEmployee.name,
        email: newEmployee.email,
        role: newEmployee.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Server error during registration.", error: error.message });
  }
};

// 2. User Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await Employee.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    // Generate JWT Token
    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name },
      process.env.JWT_SECRET || 'supersecretkey123',
      { expiresIn: '1d' }
    );

    res.json({
      message: "Login successful!",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        pto_balance: user.pto_balance
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Server error during login.", error: error.message });
  }
};