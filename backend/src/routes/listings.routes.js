const express = require('express');
const router = express.Router();
const { getListings, getListing, createListing, updateListing, deleteListing } = require('../controllers/listings.controller');
const { protect, restrict } = require('../middleware/auth');

router.get('/', getListings);                                         // public
router.get('/:id', getListing);                                       // public
router.post('/', protect, restrict('smme'), createListing);           // SMME only
router.patch('/:id', protect, restrict('smme', 'admin'), updateListing);
router.delete('/:id', protect, restrict('smme', 'admin'), deleteListing);

module.exports = router;
