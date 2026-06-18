import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';

const CATS = ['All', 'Grain', 'Vegetable', 'Fruit', 'Pulse'];

export default function Marketplace() {
  const [listings, setListings] = useState([]);
  const [cat, setCat] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getListings()
      .then(setListings)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = listings.filter(l => {
    const matchCat = cat === 'All' || l.category === cat;
    const matchSearch = !search || l.name.toLowerCase().includes(search.toLowerCase()) || l.farmerName?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <section className="marketplace-section">
      <div className="container">
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: '1.7rem', fontWeight: 800, marginBottom: 4 }}>🛒 Marketplace</h1>
          <p style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>{listings.length} listings · fresh from farmers</p>
        </div>

        <div className="filter-bar">
          <input className="search-input" placeholder="Search crops, farmers…" value={search} onChange={e => setSearch(e.target.value)} />
          {CATS.map(c => (
            <button key={c} className={`filter-btn ${cat === c ? 'active' : ''}`} onClick={() => setCat(c)}>{c}</button>
          ))}
        </div>

        <div className="listing-grid">
          {loading && <div className="empty-state"><div className="icon">⏳</div><p>Loading listings…</p></div>}
          {!loading && filtered.length === 0 && (
            <div className="empty-state">
              <div className="icon">🔍</div>
              <p>No listings match your search.</p>
            </div>
          )}
          {filtered.map(l => (
            <Link to={`/listing/${l.id}`} key={l.id} className="listing-card" style={{ display: 'block' }}>
              <div className="card-header">
                <div className="card-emoji">{l.emoji}</div>
                <div className="card-name">{l.name}</div>
                <div className="card-meta">
                  <span className="cat-badge">{l.category}</span>
                  <span>·</span>
                  <span>{l.qty} {l.unit} available</span>
                </div>
              </div>
              <div className="card-body">
                <div className="card-desc">{l.desc || 'Fresh produce direct from farm.'}</div>
                <div className="card-price">
                  <span className="amount">₹{l.price}</span>
                  <span className="unit">/ {l.unit}</span>
                </div>
              </div>
              <div className="card-footer">
                <span style={{ fontSize: '0.82rem', color: 'var(--text-light)' }}>
                  {l.farmerName}{l.farmerLocation ? ` · ${l.farmerLocation}` : ''}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {l.topBid && <span className="top-bid">Top: ₹{l.topBid}</span>}
                  <span className="bid-count">🏷 {l.bidCount}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
