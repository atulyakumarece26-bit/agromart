const jwt = require('jsonwebtoken');
const JWT_SECRET = 'agromart_secret_key_2024';

function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'No token' });
  const token = header.split(' ')[1];
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

function farmerOnly(req, res, next) {
  if (req.user.role !== 'farmer') return res.status(403).json({ error: 'Farmers only' });
  next();
}

function buyerOnly(req, res, next) {
  if (req.user.role !== 'buyer') return res.status(403).json({ error: 'Buyers only' });
  next();
}

module.exports = { auth, farmerOnly, buyerOnly, JWT_SECRET };
