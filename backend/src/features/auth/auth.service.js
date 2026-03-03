const bcrypt = require('bcrypt');
const AppError = require('../../utils/AppError');
const { isEmail, requiredString } = require('../../utils/validators');
const { findUserByEmail, createUser, findUserById } = require('./auth.repo');

const { generateToken } = require('../../utils/jwt');

const SALT_ROUNDS = 10;

function normalizeEmail(email) {
  return String(email || '')
    .trim()
    .toLowerCase();
}

async function signup({ full_name, email, password }) {
  const cleanName = requiredString(full_name);
  const cleanEmail = normalizeEmail(email);
  const cleanPassword = String(password || '');

  if (!cleanName) throw new AppError('full_name is required', 400);
  if (!cleanEmail) throw new AppError('email is required', 400);
  if (!isEmail(cleanEmail)) throw new AppError('email is invalid', 400);

  if (!cleanPassword) throw new AppError('password is required', 400);
  if (cleanPassword.length < 6)
    throw new AppError('password must be at least 6 characters', 400);

  const existing = await findUserByEmail(cleanEmail);
  if (existing) throw new AppError('email already in use', 400);

  const password_hash = await bcrypt.hash(cleanPassword, SALT_ROUNDS);

  /*  const user = await createUser({
    full_name: cleanName,
    email: cleanEmail,
    password_hash,
  });

  return user;*/

  return await createUser({
    full_name: cleanName,
    email: cleanEmail,
    password_hash,
  });
}

async function login({ email, password }) {
  const cleanEmail = normalizeEmail(email);
  const cleanPassword = String(password || '');

  if (!cleanEmail) throw new AppError('email is required', 400);
  if (!cleanPassword) throw new AppError('password is required', 400);

  const userRow = await findUserByEmail(cleanEmail);
  if (!userRow) throw new AppError('Invalid credentials', 401);

  const ok = await bcrypt.compare(cleanPassword, userRow.password_hash);
  if (!ok) throw new AppError('Invalid credentials', 401);

  const user = {
    id: userRow.id,
    full_name: userRow.full_name,
    email: userRow.email,
    role: userRow.role,
    created_at: userRow.created_at,
  };

  const token = generateToken({ id: user.id, role: user.role });

  return { token, user };
}

async function getMe(userId) {
  const user = await findUserById(userId);
  if (!user) throw new AppError('User not found', 404);
  return user;
}

module.exports = { signup, login, getMe };
