const pool = require('../config/db');

// POST /api/orders — customer places order
const createOrder = async (req, res) => {
  const { business_id, items, delivery_address, notes } = req.body;
  // items: [{ listing_id, quantity }]

  if (!business_id || !items || items.length === 0) {
    return res.status(400).json({ message: 'business_id and items are required' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Fetch listing prices
    const listingIds = items.map((i) => i.listing_id);
    const listingsResult = await client.query(
      `SELECT id, price, stock_qty, is_available FROM listings WHERE id = ANY($1::uuid[])`,
      [listingIds]
    );
    const listingMap = Object.fromEntries(listingsResult.rows.map((l) => [l.id, l]));

    // Validate and calculate total
    let total_amount = 0;
    for (const item of items) {
      const listing = listingMap[item.listing_id];
      if (!listing) throw new Error(`Listing ${item.listing_id} not found`);
      if (!listing.is_available) throw new Error(`Listing ${item.listing_id} is not available`);
      if (listing.stock_qty < item.quantity) throw new Error(`Insufficient stock for ${item.listing_id}`);
      total_amount += listing.price * item.quantity;
    }

    // Create order
    const orderResult = await client.query(
      `INSERT INTO orders (customer_id, business_id, total_amount, delivery_address, notes)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [req.user.id, business_id, total_amount, delivery_address, notes]
    );
    const order = orderResult.rows[0];

    // Insert order items + decrement stock
    for (const item of items) {
      const listing = listingMap[item.listing_id];
      await client.query(
        `INSERT INTO order_items (order_id, listing_id, quantity, unit_price)
         VALUES ($1, $2, $3, $4)`,
        [order.id, item.listing_id, item.quantity, listing.price]
      );
      await client.query(
        `UPDATE listings SET stock_qty = stock_qty - $1 WHERE id = $2`,
        [item.quantity, item.listing_id]
      );
    }

    await client.query('COMMIT');
    res.status(201).json(order);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('createOrder error:', err.message);
    res.status(400).json({ message: err.message });
  } finally {
    client.release();
  }
};

// GET /api/orders — customer sees their orders; SMME sees orders for their businesses; admin sees all
const getOrders = async (req, res) => {
  try {
    let result;
    if (req.user.role === 'admin') {
      result = await pool.query(`SELECT o.*, u.name as customer_name, bp.business_name
        FROM orders o
        JOIN users u ON o.customer_id = u.id
        JOIN business_profiles bp ON o.business_id = bp.id
        ORDER BY o.created_at DESC`);
    } else if (req.user.role === 'smme') {
      result = await pool.query(
        `SELECT o.*, u.name as customer_name
         FROM orders o
         JOIN users u ON o.customer_id = u.id
         JOIN business_profiles bp ON o.business_id = bp.id
         WHERE bp.user_id = $1
         ORDER BY o.created_at DESC`,
        [req.user.id]
      );
    } else {
      result = await pool.query(
        `SELECT o.*, bp.business_name
         FROM orders o
         JOIN business_profiles bp ON o.business_id = bp.id
         WHERE o.customer_id = $1
         ORDER BY o.created_at DESC`,
        [req.user.id]
      );
    }
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// PATCH /api/orders/:id/status — SMME or admin updates order status
const updateOrderStatus = async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['pending', 'confirmed', 'processing', 'out_for_delivery', 'delivered', 'cancelled'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status value' });
  }

  try {
    const result = await pool.query(
      `UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [status, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Order not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { createOrder, getOrders, updateOrderStatus };
