const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/listings', require('./routes/listings'));
app.use('/api/bids', require('./routes/bids'));
app.use('/api/questions', require('./routes/questions'));

app.get('/api/health', (_, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`AgroMart API running on http://localhost:${PORT}`));
