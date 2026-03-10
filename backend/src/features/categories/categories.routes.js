const express = require('express');
const { listCategoriesController } = require('./categories.controller');

const router = express.Router();

router.get('/', listCategoriesController);

module.exports = router;
