const roleMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    console.log('--- roleMiddleware ---');
    try {
      // Check if user is authenticated
      if (!req.user) {
        console.log('Authentication required');
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }
      
      console.log('User role:', req.user.role);
      console.log('Allowed roles:', allowedRoles);
      
      // Check if user role is allowed
      if (!allowedRoles.includes(req.user.role)) {
        console.log('Access not authorized for this role');
        return res.status(403).json({
          success: false,
          message: 'Access not authorized for this role'
        });
      }
      
      console.log('Role authorized');
      next();
    } catch (error) {
      console.error('Error checking permissions:', error);
      return res.status(500).json({
        success: false,
        message: 'Error checking permissions',
        error: error.message
      });
    }
  };
};

module.exports = { roleMiddleware };