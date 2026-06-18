const router = require('express').Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { auth, farmerOnly } = require('../middleware');

const EMOJIS = { Grain: '🌾', Vegetable: '🥦', Fruit: '🍎', Pulse: '🫘' };

// Public - get all open listings
router.get('/', (req, res) => {
  const listings = db.listings
    .filter(l => l.status === 'open')
    .map(l => {
      const farmer = db.users.find(u => u.id === l.farmerId);
      const bids = db.bids.filter(b => b.listingId === l.id);
      return { ...l, farmerName: farmer?.name, farmerLocation: farmer?.location, bidCount: bids.length, topBid: bids.length ? Math.max(...bids.map(b => b.amount)) : null };
    })
    .sort((a, b) => b.createdAt - a.createdAt);
  res.json(listings);
});

// Public - prices for daily table
router.get('/prices', (req, res) => {
  const prices = db.listings
    .filter(l => l.status === 'open')
    .map(l => ({ name: l.name, category: l.category, price: l.price, unit: l.unit, trend: l.trend, emoji: l.emoji }));
  res.json(prices);
});

// Auth - farmer's own listings
router.get('/mine', auth, farmerOnly, (req, res) => {
  const listings = db.listings
    .filter(l => l.farmerId === req.user.id)
    .map(l => {
      const bids = db.bids.filter(b => b.listingId === l.id).map(b => {
        const buyer = db.users.find(u => u.id === b.buyerId);
        return { ...b, buyerName: buyer?.name };
      });
      return { ...l, bids };
    })
    .sort((a, b) => b.createdAt - a.createdAt);
  res.json(listings);
});

// Public - single listing
router.get('/:id', (req, res) => {
  const l = db.listings.find(l => l.id === req.params.id);
  if (!l) return res.status(404).json({ error: 'Not found' });
  const farmer = db.users.find(u => u.id === l.farmerId);
  const bids = db.bids.filter(b => b.listingId === l.id);
  const questions = db.questions.filter(q => q.listingId === l.id).map(q => {
    const asker = db.users.find(u => u.id === q.askerId);
    return { ...q, askerName: asker?.name, askerRole: asker?.role };
  });
  res.json({ ...l, farmerName: farmer?.name, farmerLocation: farmer?.location, bidCount: bids.length, questions });
});

// Auth - create listing (farmer)
router.post('/', auth, farmerOnly, (req, res) => {
  const { name, category, qty, unit, price, desc, trend } = req.body;
  if (!name || !category || !qty || !price) return res.status(400).json({ error: 'Missing required fields' });
  const listing = {
    id: uuidv4(), farmerId: req.user.id, name, category,
    qty: Number(qty), unit: unit || 'kg', price: Number(price),
    desc: desc || '', trend: trend || 'stable',
    emoji: EMOJIS[category] || '🌿', status: 'open', acceptedBidId: null, createdAt: Date.now()
  };
  db.listings.push(listing);
  res.json(listing);
});

// Auth - accept a bid (farmer)
router.post('/:id/accept/:bidId', auth, farmerOnly, (req, res) => {
  const listing = db.listings.find(l => l.id === req.params.id);
  if (!listing) return res.status(404).json({ error: 'Listing not found' });
  if (listing.farmerId !== req.user.id) return res.status(403).json({ error: 'Not your listing' });
  const bid = db.bids.find(b => b.id === req.params.bidId && b.listingId === listing.id);
  if (!bid) return res.status(404).json({ error: 'Bid not found' });
  listing.status = 'sold';
  listing.acceptedBidId = bid.id;
  bid.status = 'accepted';
  db.bids.filter(b => b.listingId === listing.id && b.id !== bid.id).forEach(b => b.status = 'rejected');
  res.json({ listing, bid });
});

// Auth - delete listing (farmer)
router.delete('/:id', auth, farmerOnly, (req, res) => {
  const idx = db.listings.findIndex(l => l.id === req.params.id && l.farmerId === req.user.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  db.listings.splice(idx, 1);
  res.json({ ok: true });
});

module.exports = router;
