require('dotenv').config();
const pool = require('../config/db');

const createTables = async () => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // ----------------------------
    // USERS
    // ----------------------------
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name          VARCHAR(255) NOT NULL,
        email         VARCHAR(255) UNIQUE NOT NULL,
        phone         VARCHAR(20),
        password_hash TEXT NOT NULL,
        role          VARCHAR(20) NOT NULL CHECK (role IN ('smme', 'customer', 'admin')),
        is_active     BOOLEAN DEFAULT true,
        created_at    TIMESTAMP DEFAULT NOW(),
        updated_at    TIMESTAMP DEFAULT NOW()
      );
    `);

    // ----------------------------
    // BUSINESS PROFILES (for SMMEs)
    // ----------------------------
    await client.query(`
      CREATE TABLE IF NOT EXISTS business_profiles (
        id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        business_name VARCHAR(255) NOT NULL,
        description  TEXT,
        category     VARCHAR(100),
        location     VARCHAR(255),
        logo_url     TEXT,
        banner_url   TEXT,
        is_verified  BOOLEAN DEFAULT false,
        created_at   TIMESTAMP DEFAULT NOW(),
        updated_at   TIMESTAMP DEFAULT NOW()
      );
    `);

    // ----------------------------
    // LISTINGS (products/services)
    // ----------------------------
    await client.query(`
      CREATE TABLE IF NOT EXISTS listings (
        id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        business_id   UUID NOT NULL REFERENCES business_profiles(id) ON DELETE CASCADE,
        title         VARCHAR(255) NOT NULL,
        description   TEXT,
        price         NUMERIC(10, 2) NOT NULL,
        category      VARCHAR(100),
        image_url     TEXT,
        stock_qty     INT DEFAULT 0,
        is_available  BOOLEAN DEFAULT true,
        listing_type  VARCHAR(20) DEFAULT 'product' CHECK (listing_type IN ('product', 'service')),
        created_at    TIMESTAMP DEFAULT NOW(),
        updated_at    TIMESTAMP DEFAULT NOW()
      );
    `);

    // ----------------------------
    // ORDERS
    // ----------------------------
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        customer_id     UUID NOT NULL REFERENCES users(id),
        business_id     UUID NOT NULL REFERENCES business_profiles(id),
        status          VARCHAR(30) DEFAULT 'pending'
                          CHECK (status IN ('pending', 'confirmed', 'processing', 'out_for_delivery', 'delivered', 'cancelled')),
        total_amount    NUMERIC(10, 2) NOT NULL,
        delivery_address TEXT,
        notes           TEXT,
        created_at      TIMESTAMP DEFAULT NOW(),
        updated_at      TIMESTAMP DEFAULT NOW()
      );
    `);

    // ----------------------------
    // ORDER ITEMS
    // ----------------------------
    await client.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id    UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        listing_id  UUID NOT NULL REFERENCES listings(id),
        quantity    INT NOT NULL DEFAULT 1,
        unit_price  NUMERIC(10, 2) NOT NULL
      );
    `);

    // ----------------------------
    // TRANSACTIONS
    // ----------------------------
    await client.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id        UUID NOT NULL REFERENCES orders(id),
        customer_id     UUID NOT NULL REFERENCES users(id),
        amount          NUMERIC(10, 2) NOT NULL,
        gateway         VARCHAR(20) CHECK (gateway IN ('paystack', 'yoco', 'manual')),
        gateway_ref     TEXT,
        status          VARCHAR(20) DEFAULT 'pending'
                          CHECK (status IN ('pending', 'success', 'failed', 'refunded')),
        created_at      TIMESTAMP DEFAULT NOW()
      );
    `);

    await client.query('COMMIT');
    console.log('✅ All tables created successfully');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', err.message);
  } finally {
    client.release();
    pool.end();
  }
};

createTables();
