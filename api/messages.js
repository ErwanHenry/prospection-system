const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /api/messages
async function listMessages(req, res) {
  try {
    const { _start = 0, _end = 10, _sort = 'id', _order = 'ASC', campaignId, type } = req.query;
    const start = parseInt(_start);
    const end = parseInt(_end);
    const limit = end - start;

    const where = {};
    if (campaignId) where.campaignId = campaignId;
    if (type) where.type = type;

    const [messages, total] = await Promise.all([
      prisma.messageTemplate.findMany({
        where,
        skip: start,
        take: limit,
        orderBy: { [_sort]: _order.toLowerCase() },
        include: {
          campaign: true,
        },
      }),
      prisma.messageTemplate.count({ where }),
    ]);

    res.set('Content-Range', `messages ${start}-${end}/${total}`);
    res.set('Access-Control-Expose-Headers', 'Content-Range');
    res.json(messages);
  } catch (error) {
    console.error('Error listing messages:', error);
    res.status(500).json({ error: error.message });
  }
}

// GET /api/messages/:id
async function getMessage(req, res) {
  try {
    const message = await prisma.messageTemplate.findUnique({
      where: { id: req.params.id },
      include: {
        campaign: true,
      },
    });

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    res.json(message);
  } catch (error) {
    console.error('Error getting message:', error);
    res.status(500).json({ error: error.message });
  }
}

// POST /api/messages
async function createMessage(req, res) {
  try {
    const message = await prisma.messageTemplate.create({
      data: {
        campaignId: req.body.campaignId,
        type: req.body.type,
        subject: req.body.subject,
        body: req.body.body,
        delayDays: req.body.delayDays || 0,
        variants: req.body.variants,
      },
    });

    res.status(201).json(message);
  } catch (error) {
    console.error('Error creating message:', error);
    res.status(500).json({ error: error.message });
  }
}

// PUT /api/messages/:id
async function updateMessage(req, res) {
  try {
    const message = await prisma.messageTemplate.update({
      where: { id: req.params.id },
      data: {
        campaignId: req.body.campaignId,
        type: req.body.type,
        subject: req.body.subject,
        body: req.body.body,
        delayDays: req.body.delayDays,
        variants: req.body.variants,
      },
    });

    res.json(message);
  } catch (error) {
    console.error('Error updating message:', error);
    res.status(500).json({ error: error.message });
  }
}

// DELETE /api/messages/:id
async function deleteMessage(req, res) {
  try {
    await prisma.messageTemplate.delete({
      where: { id: req.params.id },
    });

    res.json({ id: req.params.id });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  listMessages,
  getMessage,
  createMessage,
  updateMessage,
  deleteMessage,
};
