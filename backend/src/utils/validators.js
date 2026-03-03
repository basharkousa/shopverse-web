function isEmail(value) {
  const v = String(value || '')
    .trim()
    .toLowerCase();
  // simple email check (good enough for now)
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

function requiredString(value) {
  return String(value || '').trim();
}

module.exports = { isEmail, requiredString };
