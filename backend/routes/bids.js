const router = require('express').Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { auth, buyerOnly } = require('../middleware');

// Buyer's own bids
router.get('/mine', auth, (req, res) => {
  const bids = db.bids
    .filter(b => b.buyerId === req.user.id)
    .map(b => {
      const listing = db.listings.find(l => l.id === b.listingId);
      return { ...b, listing };
    })
    .sort((a, b) => b.createdAt - a.createdAt);
  res.json(bids);
});

// Place a bid
router.post('/', auth, buyerOnly, (req, res) => {
  const { listingId, amount, message } = req.body;
  if (!listingId || !amount) return res.status(400).json({ error: 'listingId and amount required' });
  const listing = db.listings.find(l => l.id === listingId);
  if (!listing) return res.status(404).json({ error: 'Listing not found' });
  if (listing.status !== 'open') return res.status(400).json({ error: 'Listing is closed' });
  const existing = db.bids.find(b => b.listingId === listingId && b.buyerId === req.user.id && b.status === 'pending');
  if (existing) { existing.amount = Number(amount); existing.message = message || ''; return res.json(existing); }
  const bid = { id: uuidv4(), listingId, buyerId: req.user.id, amount: Number(amount), message: message || '', status: 'pending', createdAt: Date.now() };
  db.bids.push(bid);
  res.json(bid);
});

module.exports = router;
