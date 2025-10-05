const express = require('express');
const router = express.Router();
const {
  listCampaigns,
  getCampaign,
  createCampaign,
  updateCampaign,
  deleteCampaign,
} = require('../campaigns');

// GET /api/campaigns
router.get('/', listCampaigns);

// GET /api/campaigns/:id
router.get('/:id', getCampaign);

// POST /api/campaigns
router.post('/', createCampaign);

// PUT /api/campaigns/:id
router.put('/:id', updateCampaign);

// DELETE /api/campaigns/:id
router.delete('/:id', deleteCampaign);

module.exports = router;
