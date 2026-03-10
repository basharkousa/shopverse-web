const { listCategories } = require('./categories.repo');

async function getCategories() {
  return await listCategories();
}

module.exports = { getCategories };
