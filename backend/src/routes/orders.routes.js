const express = require('express');
const router = express.Router();
const { createOrder, getOrders, updateOrderStatus } = require('../controllers/orders.controller');
const { protect, restrict } = require('../middleware/auth');
const pool = require('../config/db');

router.post('/', protect, restrict('customer'), createOrder);
router.get('/', protect, getOrders);
router.patch('/:id/status', protect, restrict('smme', 'admin'), updateOrderStatus);
// GET /api/orders/:id — single order with items
router.get('/:id', protect, async (req, res) => {
  try {
    const orderResult = await pool.query(
      `SELECT o.*, u.name as customer_name, bp.business_name
       FROM orders o
       JOIN users u ON o.customer_id = u.id
       JOIN business_profiles bp ON o.business_id = bp.id
       WHERE o.id = $1`,
      [req.params.id]
    );
    if (orderResult.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }
    const order = orderResult.rows[0];

    const itemsResult = await pool.query(
      `SELECT oi.*, l.title, l.image_url, l.listing_type
       FROM order_items oi
       JOIN listings l ON oi.listing_id = l.id
       WHERE oi.order_id = $1`,
      [req.params.id]
    );

    res.json({ ...order, items: itemsResult.rows });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
