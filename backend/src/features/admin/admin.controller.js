const asyncHandler = require('../../utils/asyncHandler');
const { getAdminOverview } = require('./admin.service');

const getAdminOverviewController = asyncHandler(async (req, res) => {
  const overview = await getAdminOverview();

  res.json({
    ok: true,
    overview,
  });
});

module.exports = {
  getAdminOverviewController,
};
