const asyncHandler = require('../../utils/asyncHandler');
const { signup, login, getMe } = require('./auth.service');

const signupController = asyncHandler(async (req, res) => {
  const user = await signup(req.body);
  res.status(201).json({
    ok: true,
    user,
  });
});


const loginController = asyncHandler(async (req, res) => {
  const result = await login(req.body);
  res.json({ ok: true, ...result }); // { ok:true, token, user }
});

const meController = asyncHandler(async (req, res) => {
  const user = await getMe(req.user.id);
  res.json({ ok: true, user });
});

module.exports = { signupController, loginController, meController };
