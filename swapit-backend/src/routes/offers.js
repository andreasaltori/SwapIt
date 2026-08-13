const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { createOffer, updateOffer, getOffersByListing } = require('../controllers/offersController');

router.post('/', auth, createOffer);
router.put('/:id', auth, updateOffer);
router.get('/listing/:listingId', auth, getOffersByListing);

module.exports = router;
