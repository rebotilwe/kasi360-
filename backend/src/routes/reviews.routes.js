const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { protect, restrict } = require('../middleware/auth');

// POST /api/reviews — customer submits a review
router.post('/', protect, restrict('customer'), async (req, res) => {
  const { order_id, business_id, rating, comment } = req.body;

  if (!order_id || !business_id || !rating) {
    return res.status(400).json({ message: 'order_id, business_id and rating are required' });
  }
  if (rating < 1 || rating > 5) {
    return res.status(400).json({ message: 'Rating must be between 1 and 5' });
  }

  try {
    // Verify order belongs to this customer and is delivered
    const orderCheck = await pool.query(
      `SELECT id FROM orders WHERE id = $1 AND customer_id = $2`,
      [order_id, req.user.id]
    );
    if (orderCheck.rows.length === 0) {
      return res.status(403).json({ message: 'Order not found or not yours' });
    }

    const result = await pool.query(
      `INSERT INTO reviews (order_id, customer_id, business_id, rating, comment)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [order_id, req.user.id, business_id, rating, comment || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ message: 'You have already reviewed this order' });
    }
    res.status(500).json({ message: err.message });
  }
});

// GET /api/reviews/business/:id — get all reviews for a business
router.get('/business/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT r.*, u.name as customer_name
       FROM reviews r
       JOIN users u ON r.customer_id = u.id
       WHERE r.business_id = $1
       ORDER BY r.created_at DESC`,
      [req.params.id]
    );

    const reviews = result.rows;
    const avgRating = reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : null;

    res.json({ reviews, avgRating, total: reviews.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/reviews/order/:id — check if order already has a review
router.get('/order/:id', protect, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM reviews WHERE order_id = $1 AND customer_id = $2`,
      [req.params.id, req.user.id]
    );
    res.json(result.rows[0] || null);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;