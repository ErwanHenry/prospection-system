const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /api/prospects
async function listProspects(req, res) {
  try {
    const {
      _start = 0,
      _end = 10,
      _sort = 'id',
      _order = 'ASC',
      q,
      status,
      priority,
      campaignId,
    } = req.query;
    const start = parseInt(_start);
    const end = parseInt(_end);
    const limit = end - start;

    const where = {};
    if (q) {
      where.OR = [
        { fullName: { contains: q, mode: 'insensitive' } },
        { company: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
      ];
    }
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (campaignId) where.campaignId = campaignId;

    const [prospects, total] = await Promise.all([
      prisma.prospect.findMany({
        where,
        skip: start,
        take: limit,
        orderBy: { [_sort]: _order.toLowerCase() },
        include: {
          campaign: true,
        },
      }),
      prisma.prospect.count({ where }),
    ]);

    res.set('Content-Range', `prospects ${start}-${end}/${total}`);
    res.set('Access-Control-Expose-Headers', 'Content-Range');
    res.json(prospects);
  } catch (error) {
    console.error('Error listing prospects:', error);
    res.status(500).json({ error: error.message });
  }
}

// GET /api/prospects/:id
async function getProspect(req, res) {
  try {
    const prospect = await prisma.prospect.findUnique({
      where: { id: req.params.id },
      include: {
        campaign: true,
        activities: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!prospect) {
      return res.status(404).json({ error: 'Prospect not found' });
    }

    res.json(prospect);
  } catch (error) {
    console.error('Error getting prospect:', error);
    res.status(500).json({ error: error.message });
  }
}

// POST /api/prospects
async function createProspect(req, res) {
  try {
    const prospect = await prisma.prospect.create({
      data: {
        campaignId: req.body.campaignId,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        fullName: req.body.fullName,
        company: req.body.company,
        jobTitle: req.body.jobTitle,
        location: req.body.location,
        linkedinUrl: req.body.linkedinUrl,
        profilePicture: req.body.profilePicture,
        bio: req.body.bio,
        email: req.body.email,
        emailScore: req.body.emailScore,
        phone: req.body.phone,
        status: req.body.status || 'TO_CONTACT',
        tags: req.body.tags || [],
        notes: req.body.notes,
        priority: req.body.priority || 'MEDIUM',
      },
    });

    res.status(201).json(prospect);
  } catch (error) {
    console.error('Error creating prospect:', error);
    res.status(500).json({ error: error.message });
  }
}

// PUT /api/prospects/:id
async function updateProspect(req, res) {
  try {
    const prospect = await prisma.prospect.update({
      where: { id: req.params.id },
      data: {
        campaignId: req.body.campaignId,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        fullName: req.body.fullName,
        company: req.body.company,
        jobTitle: req.body.jobTitle,
        location: req.body.location,
        linkedinUrl: req.body.linkedinUrl,
        profilePicture: req.body.profilePicture,
        bio: req.body.bio,
        email: req.body.email,
        emailScore: req.body.emailScore,
        phone: req.body.phone,
        status: req.body.status,
        tags: req.body.tags,
        notes: req.body.notes,
        priority: req.body.priority,
        lastContactedAt: req.body.lastContactedAt
          ? new Date(req.body.lastContactedAt)
          : undefined,
        messagesSent: req.body.messagesSent,
        responded: req.body.responded,
      },
    });

    // Log status change as activity
    if (req.body.status !== req.body.previousStatus) {
      await prisma.activity.create({
        data: {
          prospectId: prospect.id,
          type: 'STATUS_CHANGE',
          message: `Statut changé de ${req.body.previousStatus} à ${req.body.status}`,
        },
      });
    }

    res.json(prospect);
  } catch (error) {
    console.error('Error updating prospect:', error);
    res.status(500).json({ error: error.message });
  }
}

// DELETE /api/prospects/:id
async function deleteProspect(req, res) {
  try {
    await prisma.prospect.delete({
      where: { id: req.params.id },
    });

    res.json({ id: req.params.id });
  } catch (error) {
    console.error('Error deleting prospect:', error);
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  listProspects,
  getProspect,
  createProspect,
  updateProspect,
  deleteProspect,
};
