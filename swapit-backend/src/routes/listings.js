const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  getListings, getListing, createListing,
  updateListing, deleteListing, toggleFavorite
} = require('../controllers/listingsController');

router.get('/', getListings);
router.get('/:id', getListing);
router.post('/', auth, upload.array('images', 5), createListing);
router.put('/:id', auth, updateListing);
router.delete('/:id', auth, deleteListing);
router.post('/:id/favorite', auth, toggleFavorite);

module.exports = router;
