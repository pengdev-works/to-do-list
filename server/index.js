import express from 'express';
import session from 'express-session';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';

import { pool } from './db.js';
import { hashPassword, comparePassword } from './components/hash.js';

const app = express();
const PORT = 3000;



app.use(cors());
app.use(express.json());
app.use(
  session({
    name: 'auth-session',
    secret: 'super-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, maxAge: 1000 * 60 * 60 * 24 }, // 1 day
  })
);

app.get('/get-list', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM list ORDER BY id');
    res.json({ success: true, list: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get items by list ID
app.get('/get-items/:id', async (req, res) => {
  try {
    const listId = req.params.id;
    const result = await pool.query(
      'SELECT id, description, status FROM items WHERE list_id = $1 ORDER BY id',
      [listId]
    );
    res.json({ success: true, items: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Add a new list
app.post('/add-list', async (req, res) => {
  try {
    const { listTitle } = req.body;
    if (!listTitle || !listTitle.trim()) {
      return res.status(400).json({ success: false, message: 'List title required' });
    }

    const id = uuidv4();
    await pool.query('INSERT INTO list (id, title, status) VALUES ($1, $2, $3)', [
      id,
      listTitle,
      'pending',
    ]);

    res.json({ success: true, message: 'List added successfully', list: { id, title: listTitle, status: 'pending' } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delete a list
app.post('/delete-list/:id', async (req, res) => {
  try {
    const listId = req.params.id;
    await pool.query('DELETE FROM list WHERE id = $1', [listId]);
    res.json({ success: true, message: 'List deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Add an item to a list
app.post('/add-item', async (req, res) => {
  try {
    const { listId, description } = req.body;
    if (!listId || !description || !description.trim()) {
      return res.status(400).json({ success: false, message: 'List ID and description required' });
    }

    const id = uuidv4();
    await pool.query('INSERT INTO items (id, list_id, description, status) VALUES ($1, $2, $3, $4)', [
      id,
      listId,
      description,
      'pending',
    ]);

    res.json({ success: true, message: 'Item added successfully', item: { id, list_id: listId, description, status: 'pending' } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Register
app.post('/register', async (req, res) => {
  try {
    const { username, password, confirm, name } = req.body;
    if (!username || !password || !confirm || !name) {
      return res.status(400).json({ success: false, message: 'Incomplete data' });
    }
    if (password !== confirm) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }

    const exists = await pool.query('SELECT id FROM users WHERE username = $1', [username]);
    if (exists.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const hashedPassword = await hashPassword(password);
    await pool.query('INSERT INTO users (username, password, name) VALUES ($1, $2, $3)', [
      username,
      hashedPassword,
      name,
    ]);

    res.json({ success: true, message: 'Registered successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Login
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Incomplete data' });
    }

    const result = await pool.query('SELECT id, username, name, password FROM users WHERE username = $1', [username]);
    if (result.rows.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid username or password' });
    }

    const user = result.rows[0];
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid username or password' });
    }

    req.session.user = { id: user.id, name: user.name };
    res.json({ success: true, message: 'Login successful', user: req.session.user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get session
app.get('/get-session', (req, res) => {
  if (req.session.user) {
    return res.json({ session: true, user: req.session.user });
  }
  res.json({ session: false });
});

// Logout
app.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ success: false, message: 'Logout failed' });
    res.clearCookie('auth-session');
    res.json({ success: true, message: 'Logged out successfully' });
  });
});

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
