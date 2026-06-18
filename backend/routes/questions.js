const router = require('express').Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { auth } = require('../middleware');

// Ask a question on a listing
router.post('/', auth, (req, res) => {
  const { listingId, text } = req.body;
  if (!listingId || !text) return res.status(400).json({ error: 'listingId and text required' });
  const listing = db.listings.find(l => l.id === listingId);
  if (!listing) return res.status(404).json({ error: 'Listing not found' });
  const q = { id: uuidv4(), listingId, askerId: req.user.id, text, answer: null, createdAt: Date.now() };
  db.questions.push(q);
  const asker = db.users.find(u => u.id === req.user.id);
  res.json({ ...q, askerName: asker?.name, askerRole: asker?.role });
});

// Farmer answers a question
router.post('/:id/answer', auth, (req, res) => {
  const q = db.questions.find(q => q.id === req.params.id);
  if (!q) return res.status(404).json({ error: 'Question not found' });
  const listing = db.listings.find(l => l.id === q.listingId);
  if (listing.farmerId !== req.user.id) return res.status(403).json({ error: 'Not your listing' });
  q.answer = req.body.answer;
  res.json(q);
});

module.exports = router;
