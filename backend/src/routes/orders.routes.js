const express = require('express');
const router = express.Router();
const { createOrder, getOrders, updateOrderStatus } = require('../controllers/orders.controller');
const { protect, restrict } = require('../middleware/auth');

router.post('/', protect, restrict('customer'), createOrder);
router.get('/', protect, getOrders);
router.patch('/:id/status', protect, restrict('smme', 'admin'), updateOrderStatus);

module.exports = router;
