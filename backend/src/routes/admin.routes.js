const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { protect, restrict } = require('../middleware/auth');

// GET /api/admin/users — all users
router.get('/users', protect, restrict('admin'), async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, phone, role, is_active, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/admin/users/:id — toggle active status
router.patch('/users/:id', protect, restrict('admin'), async (req, res) => {
  const { is_active } = req.body;
  try {
    const result = await pool.query(
      'UPDATE users SET is_active = $1, updated_at = NOW() WHERE id = $2 RETURNING id, name, email, role, is_active',
      [is_active, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'User not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;