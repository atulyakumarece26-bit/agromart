const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// ─── In-memory store ───────────────────────────────────────────────────────────
const db = {
  users: [],
  listings: [],
  bids: [],
  questions: [],
};

// ─── Seed data ─────────────────────────────────────────────────────────────────
function seed() {
  const farmerId = uuidv4();
  const buyerId = uuidv4();

  db.users.push(
    { id: farmerId, name: 'Ramlal Yadav', username: 'ramlal', password: bcrypt.hashSync('farmer123', 10), role: 'farmer', location: 'Jaipur, Rajasthan', createdAt: Date.now() },
    { id: buyerId, name: 'Priya Sharma', username: 'priya', password: bcrypt.hashSync('buyer123', 10), role: 'buyer', location: 'Delhi', createdAt: Date.now() }
  );

  const listings = [
    { name: 'Wheat (Gehun)', category: 'Grain', qty: 500, unit: 'kg', price: 24, desc: 'Premium quality HD-2967 wheat, low moisture.', trend: 'up', emoji: '🌾' },
    { name: 'Tomatoes', category: 'Vegetable', qty: 200, unit: 'kg', price: 18, desc: 'Fresh vine-ripened tomatoes, farm-to-table.', trend: 'down', emoji: '🍅' },
    { name: 'Basmati Rice', category: 'Grain', qty: 300, unit: 'kg', price: 85, desc: 'Long-grain Pusa Basmati 1121, aged 1 year.', trend: 'up', emoji: '🍚' },
    { name: 'Yellow Mustard', category: 'Pulse', qty: 150, unit: 'kg', price: 55, desc: 'Cold-pressed quality, low erucic acid.', trend: 'stable', emoji: '🌻' },
    { name: 'Alphonso Mango', category: 'Fruit', qty: 100, unit: 'kg', price: 320, desc: 'GI-tagged Devgad Alphonso, ready to ship.', trend: 'up', emoji: '🥭' },
    { name: 'Green Peas', category: 'Vegetable', qty: 80, unit: 'kg', price: 45, desc: 'Fresh shelled peas, harvested this morning.', trend: 'stable', emoji: '🫛' },
  ];

  listings.forEach(l => {
    const id = uuidv4();
    db.listings.push({ id, farmerId, ...l, status: 'open', acceptedBidId: null, createdAt: Date.now() - Math.random() * 86400000 });
  });

  // Seed one bid
  const bidId = uuidv4();
  db.bids.push({ id: bidId, listingId: db.listings[0].id, buyerId, amount: 22, message: 'Can you give me 400 kg at this rate?', status: 'pending', createdAt: Date.now() });
}

seed();

module.exports = db;
