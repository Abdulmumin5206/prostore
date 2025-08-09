import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

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

function setAuthCookie(req, res, token) {
  const isProd = process.env.NODE_ENV === 'production';
  const cookieName = getCookieNameFromOrigin(req.headers.origin);
  res.cookie(cookieName, token, {
    httpOnly: true,
    sameSite: isProd ? 'none' : 'lax',
    secure: isProd,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

function clearAuthCookie(req, res) {
  const cookieName = getCookieNameFromOrigin(req.headers.origin);
  res.clearCookie(cookieName, { httpOnly: true });
}

router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Missing fields' });
    }
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: 'Email already in use' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '7d' });
    setAuthCookie(req, res, token);
    return res.status(201).json({ user: user.toSafeJSON() });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Missing fields' });
    }
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '7d' });
    setAuthCookie(req, res, token);
    return res.json({ user: user.toSafeJSON() });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
});

router.post('/logout', (req, res) => {
  clearAuthCookie(req, res);
  return res.json({ message: 'ok' });
});

router.get('/me', authenticate, (req, res) => {
  return res.json({ user: req.user.toSafeJSON() });
});

export default router; 