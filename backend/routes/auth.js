const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { JWT_SECRET } = require('../middleware');

router.post('/signup', async (req, res) => {
  const { name, username, password, role, location } = req.body;
  if (!name || !username || !password || !role) return res.status(400).json({ error: 'All fields required' });
  if (!['farmer', 'buyer'].includes(role)) return res.status(400).json({ error: 'Role must be farmer or buyer' });
  if (db.users.find(u => u.username === username)) return res.status(409).json({ error: 'Username taken' });
  const user = { id: uuidv4(), name, username, password: bcrypt.hashSync(password, 10), role, location: location || '', createdAt: Date.now() };
  db.users.push(user);
  const token = jwt.sign({ id: user.id, username: user.username, name: user.name, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, name: user.name, username: user.username, role: user.role, location: user.location } });
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = db.users.find(u => u.username === username);
  if (!user || !bcrypt.compareSync(password, user.password)) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ id: user.id, username: user.username, name: user.name, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, name: user.name, username: user.username, role: user.role, location: user.location } });
});

module.exports = router;
