import jwt from 'jsonwebtoken';
import User from '../models/User.js';

function getCookieNameFromOrigin(originHeader) {
  if (!originHeader) return 'token';
  try {
    const url = new URL(originHeader);
    const port = url.port || (url.protocol === 'http:' ? '80' : '443');
    return `token_${port}`;
  } catch {
    return 'token';
  }
}

export async function authenticate(req, res, next) {
  try {
    const origin = req.headers.origin;
    const cookieName = getCookieNameFromOrigin(origin);
    const token = req.cookies?.[cookieName] || req.cookies?.token;
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
    const user = await User.findById(payload.userId);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
}

export function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden' });
  }
  next();
} 