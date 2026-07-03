const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { protect, restrict } = require('../middleware/auth');

// POST /api/businesses — create business profile
router.post('/', protect, restrict('smme'), async (req, res) => {
  const { business_name, description, category, location } = req.body;
  if (!business_name) return res.status(400).json({ message: 'Business name required' });
  try {
    const result = await pool.query(
      `INSERT INTO business_profiles (user_id, business_name, description, category, location)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [req.user.id, business_name, description, category, location]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/businesses/mine — get my business profile
router.get('/mine', protect, restrict('smme'), async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM business_profiles WHERE user_id = $1',
      [req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'No business profile found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// GET /api/businesses/:id — public, get business profile + listings
router.get('/:id', async (req, res) => {
  try {
    const bizResult = await pool.query(
      'SELECT * FROM business_profiles WHERE id = $1',
      [req.params.id]
    );
    if (bizResult.rows.length === 0) {
      return res.status(404).json({ message: 'Business not found' });
    }
    const business = bizResult.rows[0];

    const listingsResult = await pool.query(
      `SELECT * FROM listings WHERE business_id = $1 AND is_available = true ORDER BY created_at DESC`,
      [req.params.id]
    );

    res.json({ ...business, listings: listingsResult.rows });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;