const express = require('express');
const router = express.Router();
const {
  listActivities,
  createActivity,
} = require('../activities');

router.get('/', listActivities);
router.post('/', createActivity);

module.exports = router;
