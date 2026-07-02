require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('./src/config/db');

const createAdmin = async () => {
  const hash = await bcrypt.hash('admin123', 12);
  const result = await pool.query(
    `INSERT INTO users (name, email, phone, password_hash, role)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, name, email, role`,
    ['Admin User', 'admin@kasi360.com', '0800000000', hash, 'admin']
  );
  console.log('Admin created:', result.rows[0]);
  process.exit(0);
};

createAdmin();