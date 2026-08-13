const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const { getUser, updateMe, getMyListings, getMyFavorites } = require('../controllers/usersController');

router.get('/me/listings', auth, getMyListings);
router.get('/me/favorites', auth, getMyFavorites);
router.put('/me', auth, upload.single('avatar'), updateMe);
router.get('/:id', getUser);

module.exports = router;
