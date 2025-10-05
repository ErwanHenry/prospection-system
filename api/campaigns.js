const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /api/campaigns
async function listCampaigns(req, res) {
  try {
    const { _start = 0, _end = 10, _sort = 'id', _order = 'ASC', status } = req.query;
    const start = parseInt(_start);
    const end = parseInt(_end);
    const limit = end - start;

    const where = status ? { status } : {};

    const [campaigns, total] = await Promise.all([
      prisma.campaign.findMany({
        where,
        skip: start,
        take: limit,
        orderBy: { [_sort]: _order.toLowerCase() },
        include: {
          _count: {
            select: { prospects: true, messages: true },
          },
        },
      }),
      prisma.campaign.count({ where }),
    ]);

    res.set('Content-Range', `campaigns ${start}-${end}/${total}`);
    res.set('Access-Control-Expose-Headers', 'Content-Range');
    res.json(campaigns);
  } catch (error) {
    console.error('Error listing campaigns:', error);
    res.status(500).json({ error: error.message });
  }
}

// GET /api/campaigns/:id
async function getCampaign(req, res) {
  try {
    const campaign = await prisma.campaign.findUnique({
      where: { id: req.params.id },
      include: {
        prospects: true,
        messages: true,
      },
    });

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    res.json(campaign);
  } catch (error) {
    console.error('Error getting campaign:', error);
    res.status(500).json({ error: error.message });
  }
}

// POST /api/campaigns
async function createCampaign(req, res) {
  try {
    const campaign = await prisma.campaign.create({
      data: {
        name: req.body.name,
        status: req.body.status || 'DRAFT',
        linkedinSearchUrl: req.body.linkedinSearchUrl,
        filters: req.body.filters,
        maxProspects: req.body.maxProspects || 1000,
        startDate: req.body.startDate ? new Date(req.body.startDate) : null,
        endDate: req.body.endDate ? new Date(req.body.endDate) : null,
        dailyLimit: req.body.dailyLimit || 50,
      },
    });

    res.status(201).json(campaign);
  } catch (error) {
    console.error('Error creating campaign:', error);
    res.status(500).json({ error: error.message });
  }
}

// PUT /api/campaigns/:id
async function updateCampaign(req, res) {
  try {
    const campaign = await prisma.campaign.update({
      where: { id: req.params.id },
      data: {
        name: req.body.name,
        status: req.body.status,
        linkedinSearchUrl: req.body.linkedinSearchUrl,
        filters: req.body.filters,
        maxProspects: req.body.maxProspects,
        startDate: req.body.startDate ? new Date(req.body.startDate) : null,
        endDate: req.body.endDate ? new Date(req.body.endDate) : null,
        dailyLimit: req.body.dailyLimit,
        prospectsScraped: req.body.prospectsScraped,
        messagesSent: req.body.messagesSent,
        responsesReceived: req.body.responsesReceived,
      },
    });

    res.json(campaign);
  } catch (error) {
    console.error('Error updating campaign:', error);
    res.status(500).json({ error: error.message });
  }
}

// DELETE /api/campaigns/:id
async function deleteCampaign(req, res) {
  try {
    await prisma.campaign.delete({
      where: { id: req.params.id },
    });

    res.json({ id: req.params.id });
  } catch (error) {
    console.error('Error deleting campaign:', error);
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  listCampaigns,
  getCampaign,
  createCampaign,
  updateCampaign,
  deleteCampaign,
};
