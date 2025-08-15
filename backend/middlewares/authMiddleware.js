const jwt = require('jsonwebtoken');
const { User } = require('../models');

const authMiddleware = async (req, res, next) => {
  console.log('--- authMiddleware ---');
  try {
    // Get token from Authorization header
    const authHeader = req.header('Authorization');
    console.log('Authorization Header:', authHeader);
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('Access token required');
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }
    
    const token = authHeader.substring(7); // Remove "Bearer "
    console.log('Token:', token);
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded Token:', decoded);
    
    // Find user
    const user = await User.findById(decoded.userId);
    console.log('User found:', user ? user.email : 'Not found');
    
    if (!user) {
      console.log('User not found');
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if account is active
    if (!user.isActive) {
      console.log('Account disabled');
      return res.status(401).json({
        success: false,
        message: 'Account disabled'
      });
    }
    
    // Add user to request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName
    };
    console.log('User authenticated:', req.user.email);
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Authentication error',
      error: error.message
    });
  }
};

module.exports = { authMiddleware };