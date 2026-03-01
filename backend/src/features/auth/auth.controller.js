const asyncHandler = require('../../utils/asyncHandler');
const { signup } = require('./auth.service');

const signupController = asyncHandler(async (req, res) => {
  const user = await signup(req.body);
  res.status(201).json({
    ok: true,
    user,
  });
});

module.exports = { signupController };
