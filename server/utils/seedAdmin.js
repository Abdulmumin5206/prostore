import bcrypt from 'bcryptjs';
import User from '../models/User.js';

export async function ensureAdminExists() {
  const email = process.env.ADMIN_EMAIL || 'admin';
  const password = process.env.ADMIN_PASSWORD || 'admin';
  const name = process.env.ADMIN_NAME || 'Administrator';

  const existing = await User.findOne({ email });
  if (existing) return;

  const passwordHash = await bcrypt.hash(password, 10);
  await User.create({ name, email, passwordHash, role: 'admin' });
  console.log('Seeded default admin user');
}

export async function ensureDemoUserExists() {
  const email = process.env.DEMO_USER_EMAIL || 'user';
  const password = process.env.DEMO_USER_PASSWORD || 'user';
  const name = process.env.DEMO_USER_NAME || 'Demo User';

  const existing = await User.findOne({ email });
  if (existing) return;

  const passwordHash = await bcrypt.hash(password, 10);
  await User.create({ name, email, passwordHash, role: 'user' });
  console.log('Seeded default demo user');
} 