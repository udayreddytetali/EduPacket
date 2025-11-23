const jwt = require('jsonwebtoken');

// Middleware to authenticate JWT token
function authenticateToken(req, res, next) {
  console.log('[AUTH] Stage 1: authenticateToken called');
  const authHeader = req.headers['authorization'];
  console.log('[AUTH] Stage 2: Authorization header:', authHeader);
  const token = authHeader && authHeader.split(' ')[1];
  console.log('[AUTH] Stage 3: Extracted token:', token);
  if (!token) {
    console.log('[AUTH] Stage 4: No token provided');
    return res.status(401).json({ message: 'No token provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.log('[AUTH] Stage 5: Invalid token', err);
      return res.status(403).json({ message: 'Invalid token' });
    }
    console.log('[AUTH] Stage 6: Token verified, user:', user);
    req.user = user;
    next();
  });
}

// Middleware to authorize roles
function authorizeRoles(...roles) {
  return (req, res, next) => {
    console.log('[AUTH] authorizeRoles called. Required roles:', roles, 'User:', req.user);
    if (!req.user) {
      console.log('[AUTH] authorizeRoles: No user found on request');
      return res.status(403).json({ message: 'Access denied: no user' });
    }
    if (!roles.includes(req.user.role)) {
      console.log('[AUTH] authorizeRoles: User role not permitted', req.user.role);
      return res.status(403).json({ message: 'Access denied: insufficient role' });
    }
    console.log('[AUTH] authorizeRoles: User role permitted', req.user.role);
    next();
  };
}

module.exports = { authenticateToken, authorizeRoles };
