const jwt = require('jsonwebtoken');
const logger = require('../logger');

// Middleware to authenticate JWT token
function authenticateToken(req, res, next) {
  logger.debug('[AUTH] Stage 1: authenticateToken called');
  const authHeader = req.headers['authorization'];
  logger.debug('[AUTH] Stage 2: Authorization header:', authHeader);
  const token = authHeader && authHeader.split(' ')[1];
  logger.debug('[AUTH] Stage 3: Extracted token:', token);
  if (!token) {
    logger.debug('[AUTH] Stage 4: No token provided');
    return res.status(401).json({ message: 'No token provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      logger.debug('[AUTH] Stage 5: Invalid token', err);
      return res.status(403).json({ message: 'Invalid token' });
    }
    logger.debug('[AUTH] Stage 6: Token verified, user:', user);
    req.user = user;
    next();
  });
}

// Middleware to authorize roles
function authorizeRoles(...roles) {
  return (req, res, next) => {
    logger.debug('[AUTH] authorizeRoles called. Required roles:', roles, 'User:', req.user);
    if (!req.user) {
      logger.debug('[AUTH] authorizeRoles: No user found on request');
      return res.status(403).json({ message: 'Access denied: no user' });
    }
    if (!roles.includes(req.user.role)) {
      logger.debug('[AUTH] authorizeRoles: User role not permitted', req.user.role);
      return res.status(403).json({ message: 'Access denied: insufficient role' });
    }
    logger.debug('[AUTH] authorizeRoles: User role permitted', req.user.role);
    next();
  };
}

module.exports = { authenticateToken, authorizeRoles };
