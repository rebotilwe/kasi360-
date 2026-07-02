const jwt = require('jsonwebtoken');

// Verify JWT and attach user to req
const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorised — no token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role, email }
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Unauthorised — invalid or expired token' });
  }
};

// Role-based access guard
// Usage: restrict('admin') or restrict('smme', 'admin')
const restrict = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied — requires role: ${roles.join(' or ')}`,
      });
    }
    next();
  };
};

module.exports = { protect, restrict };
