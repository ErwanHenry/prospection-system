const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /api/activities
async function listActivities(req, res) {
  try {
    const { _start = 0, _end = 10, _sort = 'createdAt', _order = 'DESC', prospectId } = req.query;
    const start = parseInt(_start);
    const end = parseInt(_end);
    const limit = end - start;

    const where = {};
    if (prospectId) where.prospectId = prospectId;

    const [activities, total] = await Promise.all([
      prisma.activity.findMany({
        where,
        skip: start,
        take: limit,
        orderBy: { [_sort]: _order.toLowerCase() },
        include: {
          prospect: true,
        },
      }),
      prisma.activity.count({ where }),
    ]);

    res.set('Content-Range', `activities ${start}-${end}/${total}`);
    res.set('Access-Control-Expose-Headers', 'Content-Range');
    res.json(activities);
  } catch (error) {
    console.error('Error listing activities:', error);
    res.status(500).json({ error: error.message });
  }
}

// POST /api/activities
async function createActivity(req, res) {
  try {
    const activity = await prisma.activity.create({
      data: {
        prospectId: req.body.prospectId,
        type: req.body.type,
        message: req.body.message,
        metadata: req.body.metadata,
      },
    });

    res.status(201).json(activity);
  } catch (error) {
    console.error('Error creating activity:', error);
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  listActivities,
  createActivity,
};
