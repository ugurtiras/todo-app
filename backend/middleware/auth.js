const jwt = require('jsonwebtoken');
const User = require('../models/User');

// JWT Authentication middleware
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      error: 'Access token required' 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid token - user not found' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(403).json({ 
      error: 'Invalid or expired token' 
    });
  }
};

// Error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // MySQL duplicate entry error
  if (err.code === 'ER_DUP_ENTRY') {
    if (err.sqlMessage.includes('email')) {
      return res.status(400).json({ 
        error: 'Email already exists' 
      });
    }
    if (err.sqlMessage.includes('username')) {
      return res.status(400).json({ 
        error: 'Username already exists' 
      });
    }
  }

  // MySQL connection error
  if (err.code === 'ECONNREFUSED' || err.code === 'ER_ACCESS_DENIED_ERROR') {
    return res.status(500).json({ 
      error: 'Database connection error' 
    });
  }

  // Joi validation error
  if (err.isJoi) {
    return res.status(400).json({ 
      error: err.details[0].message 
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ 
      error: 'Invalid token' 
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ 
      error: 'Token expired' 
    });
  }

  // Default error response
  res.status(500).json({ 
    error: 'Internal server error' 
  });
};

// Request logging middleware
const requestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`${timestamp} - ${req.method} ${req.path} - IP: ${req.ip}`);
  next();
};

module.exports = {
  authenticateToken,
  errorHandler,
  requestLogger
};