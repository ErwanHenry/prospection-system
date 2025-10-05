const express = require('express');
const router = express.Router();
const {
  listMessages,
  getMessage,
  createMessage,
  updateMessage,
  deleteMessage,
} = require('../messages');

router.get('/', listMessages);
router.get('/:id', getMessage);
router.post('/', createMessage);
router.put('/:id', updateMessage);
router.delete('/:id', deleteMessage);

module.exports = router;
