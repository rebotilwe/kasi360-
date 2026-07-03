const pool = require('../config/db');

// GET /api/listings — public, with optional search/category filter
const getListings = async (req, res) => {
  const { search, category, listing_type, sort, page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  let query = `
    SELECT l.*, bp.business_name, bp.location
    FROM listings l
    JOIN business_profiles bp ON l.business_id = bp.id
    WHERE l.is_available = true
  `;
  const params = [];

  if (search) {
    params.push(`%${search}%`);
    query += ` AND (l.title ILIKE $${params.length} OR l.description ILIKE $${params.length})`;
  }
  if (category) {
    params.push(category);
    query += ` AND l.category = $${params.length}`;
  }
  if (listing_type) {
    params.push(listing_type);
    query += ` AND l.listing_type = $${params.length}`;
  }

  // Sort
  if (sort === 'price_asc') {
    query += ` ORDER BY l.price ASC`;
  } else if (sort === 'price_desc') {
    query += ` ORDER BY l.price DESC`;
  } else {
    query += ` ORDER BY l.created_at DESC`;
  }

  params.push(limit, offset);
  query += ` LIMIT $${params.length - 1} OFFSET $${params.length}`;

  try {
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('getListings error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};
// GET /api/listings/:id — single listing
const getListing = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT l.*, bp.business_name, bp.location, bp.logo_url
       FROM listings l
       JOIN business_profiles bp ON l.business_id = bp.id
       WHERE l.id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Listing not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/listings — SMME only
const createListing = async (req, res) => {
  const { business_id, title, description, price, category, image_url, stock_qty, listing_type } = req.body;

  if (!business_id || !title || !price) {
    return res.status(400).json({ message: 'business_id, title, and price are required' });
  }

  try {
    // Verify the business belongs to this user
    const biz = await pool.query(
      'SELECT id FROM business_profiles WHERE id = $1 AND user_id = $2',
      [business_id, req.user.id]
    );
    if (biz.rows.length === 0) {
      return res.status(403).json({ message: 'Business not found or not yours' });
    }

    const result = await pool.query(
      `INSERT INTO listings (business_id, title, description, price, category, image_url, stock_qty, listing_type)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING *`,
      [business_id, title, description, price, category, image_url, stock_qty || 0, listing_type || 'product']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('createListing error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// PATCH /api/listings/:id — SMME only
const updateListing = async (req, res) => {
  const fields = ['title', 'description', 'price', 'category', 'image_url', 'stock_qty', 'is_available'];
  const updates = [];
  const params = [];

  fields.forEach((field) => {
    if (req.body[field] !== undefined) {
      params.push(req.body[field]);
      updates.push(`${field} = $${params.length}`);
    }
  });

  if (updates.length === 0) return res.status(400).json({ message: 'No fields to update' });

  params.push(req.params.id);
  const setClause = updates.join(', ');

  try {
    const result = await pool.query(
      `UPDATE listings SET ${setClause}, updated_at = NOW()
       WHERE id = $${params.length}
       RETURNING *`,
      params
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Listing not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/listings/:id — SMME or admin
const deleteListing = async (req, res) => {
  try {
    await pool.query('DELETE FROM listings WHERE id = $1', [req.params.id]);
    res.json({ message: 'Listing deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getListings, getListing, createListing, updateListing, deleteListing };
