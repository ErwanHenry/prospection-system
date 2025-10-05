const express = require('express');
const router = express.Router();
const {
  listProspects,
  getProspect,
  createProspect,
  updateProspect,
  deleteProspect,
} = require('../prospects');

router.get('/', listProspects);
router.get('/:id', getProspect);
router.post('/', createProspect);
router.put('/:id', updateProspect);
router.delete('/:id', deleteProspect);

module.exports = router;
