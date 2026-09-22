const jwt = require('jsonwebtoken');

// 1. Verify JWT Token
exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey123');
    req.user = verified; // Attach payload { id, role, name } to req
    next();
  } catch (error) {
    res.status(403).json({ message: "Invalid or expired token." });
  }
};

// 2. Check Manager / Admin Role
exports.isManager = (req, res, next) => {
  if (req.user.role !== 'Manager' && req.user.role !== 'Admin') {
    return res.status(403).json({ message: "Access restricted to Managers/Admins." });
  }
  next();
};