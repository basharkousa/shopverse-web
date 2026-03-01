const bcrypt = require('bcrypt');
const AppError = require('../../utils/AppError');
const { findUserByEmail, createUser } = require('./auth.repo');

const SALT_ROUNDS = 10;

function normalizeEmail(email) {
  return String(email || '')
    .trim()
    .toLowerCase();
}

async function signup({ full_name, email, password }) {
  const cleanName = String(full_name || '').trim();
  const cleanEmail = normalizeEmail(email);
  const cleanPassword = String(password || '');

  // basic validation
  if (!cleanName) throw new AppError('full_name is required', 400);
  if (!cleanEmail) throw new AppError('email is required', 400);
  if (!cleanPassword) throw new AppError('password is required', 400);
  if (cleanPassword.length < 6)
    throw new AppError('password must be at least 6 characters', 400);

  const existing = await findUserByEmail(cleanEmail);
  if (existing) throw new AppError('Email already in use', 400);

  const password_hash = await bcrypt.hash(cleanPassword, SALT_ROUNDS);

  const user = await createUser({
    full_name: cleanName,
    email: cleanEmail,
    password_hash,
  });

  return user;
}

module.exports = { signup };
