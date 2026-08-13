const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getMessages, sendMessage, getInbox } = require('../controllers/messagesController');

router.get('/inbox', auth, getInbox);
router.get('/:listingId', auth, getMessages);
router.post('/', auth, sendMessage);

module.exports = router;
