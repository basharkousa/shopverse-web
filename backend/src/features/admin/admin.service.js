const { getOverviewStats } = require('./admin.repo');

async function getAdminOverview() {
  return await getOverviewStats();
}

module.exports = {
  getAdminOverview,
};
