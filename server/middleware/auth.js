import jwt from 'jsonwebtoken';

export const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Access denied — no token provided' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'agrichain-zk-hackathon-secret-2026');
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export const roleGuard = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) return res.status(403).json({ error: 'Forbidden' });
  next();
};
