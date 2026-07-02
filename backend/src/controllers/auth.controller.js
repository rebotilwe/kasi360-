const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

const register = async (req, res) => {
  const { name, email, phone, password, role } = req.body;

  // Validation
  if (!name || !email || !password || !role) {
    return res.status(400).json({ 
      message: 'Name, email, password and role are required' 
    });
  }

  const validRoles = ['smme', 'customer'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ 
      message: 'Role must be smme or customer' 
    });
  }

  try {
    // Check if user exists
    const existing = await pool.query(
      'SELECT id FROM users WHERE email = $1', 
      [email]
    );
    
    if (existing.rows && existing.rows.length > 0) {
      return res.status(409).json({ 
        message: 'Email already registered' 
      });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 12);

    // Insert user
    const result = await pool.query(
      `INSERT INTO users (name, email, phone, password_hash, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, phone, role, created_at`,
      [name, email, phone || null, password_hash, role]
    );

    if (!result.rows || result.rows.length === 0) {
      return res.status(500).json({ 
        message: 'Failed to create user' 
      });
    }

    const user = result.rows[0];
    const token = generateToken(user);

    res.status(201).json({ 
      message: 'User registered successfully',
      user, 
      token 
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ 
      message: 'Server error', 
      error: err.message 
    });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ 
      message: 'Email and password are required' 
    });
  }

  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1 AND is_active = true',
      [email]
    );

    if (!result.rows || result.rows.length === 0) {
      return res.status(401).json({ 
        message: 'Invalid credentials' 
      });
    }

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password_hash);

    if (!match) {
      return res.status(401).json({ 
        message: 'Invalid credentials' 
      });
    }

    const token = generateToken(user);
    const { password_hash, ...safeUser } = user;
    
    res.json({ 
      message: 'Login successful',
      user: safeUser, 
      token 
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ 
      message: 'Server error', 
      error: err.message 
    });
  }
};

const getMe = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, phone, role, is_active, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    
    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({ 
        message: 'User not found' 
      });
    }
    
    res.json({ 
      user: result.rows[0] 
    });
  } catch (err) {
    console.error('GetMe error:', err);
    res.status(500).json({ 
      message: 'Server error', 
      error: err.message 
    });
  }
};

module.exports = { register, login, getMe };