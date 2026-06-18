import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';

export default function Home({ onAuthOpen }) {
  const [prices, setPrices] = useState([]);
  const [listings, setListings] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.getPrices().then(setPrices).catch(() => {});
    api.getListings().then(l => setListings(l.slice(0, 6))).catch(() => {});
  }, []);

  const trendIcon = (t) => t === 'up' ? '↑' : t === 'down' ? '↓' : '→';
  const trendClass = (t) => t === 'up' ? 'up' : t === 'down' ? 'down' : 'stable';

  return (
    <>
      {/* ─── Hero ─── */}
      <section className="hero">
        <div className="hero-inner">
          <div>
            <div className="hero-badge">🇮🇳 India's Farm Network</div>
            <h1>From <em>Field</em> to<br />Your Doorstep</h1>
            <p>AgroMart connects farmers directly with buyers — fair prices, no middlemen, fresh produce.</p>
            <div className="hero-cta">
              <button className="btn-white" onClick={() => navigate('/marketplace')}>Browse Market</button>
              <button className="btn-ghost" onClick={onAuthOpen}>List Your Crop</button>
            </div>
            <div className="hero-stats">
              <div className="hero-stat"><div className="val">{listings.length}+</div><div className="lbl">Live Listings</div></div>
              <div className="hero-stat"><div className="val">4</div><div className="lbl">Categories</div></div>
              <div className="hero-stat"><div className="val">0%</div><div className="lbl">Commission</div></div>
            </div>
          </div>
          <div className="hero-card">
            <div className="hero-card-title">📊 Live Mandi Prices</div>
            {prices.slice(0, 5).map((p, i) => (
              <div key={i} className="price-row">
                <div className="price-crop">{p.emoji} {p.name}</div>
                <div className={`price-val trend-${trendIcon(p.trend) === '↑' ? 'up' : trendIcon(p.trend) === '↓' ? 'down' : 'stable'}`}>
                  ₹{p.price}/{p.unit} <span style={{ fontSize: '0.8rem' }}>{trendIcon(p.trend)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Daily Prices Table ─── */}
      <section className="prices-section">
        <div className="container">
          <div className="section-header">
            <div>
              <div className="section-title">📋 Today's Crop Prices</div>
              <div className="section-sub">Live from active listings — updated in real time</div>
            </div>
            <Link to="/marketplace" className="btn btn-secondary btn-sm">View all →</Link>
          </div>
          <table className="price-table">
            <thead>
              <tr>
                <th>Crop</th>
                <th>Category</th>
                <th>Price / unit</th>
                <th>Trend</th>
              </tr>
            </thead>
            <tbody>
              {prices.map((p, i) => (
                <tr key={i}>
                  <td><div className="crop-cell">{p.emoji} {p.name}</div></td>
                  <td><span className="cat-badge">{p.category}</span></td>
                  <td><span className="price-amount">₹{p.price}</span> <span style={{ color: 'var(--text-light)', fontSize: '0.82rem' }}>/ {p.unit}</span></td>
                  <td>
                    <span className={`trend-chip ${trendClass(p.trend)}`}>
                      {trendIcon(p.trend)} {p.trend}
                    </span>
                  </td>
                </tr>
              ))}
              {prices.length === 0 && (
                <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-light)', padding: 24 }}>No listings yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ─── How it works ─── */}
      <section className="how-section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 8 }}>
            <div className="section-title">How AgroMart works</div>
            <p style={{ color: 'var(--text-light)', marginTop: 6, fontSize: '0.9rem' }}>Simple three-step process for both farmers and buyers</p>
          </div>
          <div className="how-grid">
            <div className="how-card">
              <div className="how-icon">🌾</div>
              <h3>Farmers List</h3>
              <p>Create an account, add your crop with quantity and asking price. Takes under a minute.</p>
            </div>
            <div className="how-card">
              <div className="how-icon">🤝</div>
              <h3>Buyers Bid</h3>
              <p>Browse listings, filter by category, place bids, and message farmers directly.</p>
            </div>
            <div className="how-card">
              <div className="how-icon">✅</div>
              <h3>Deal Done</h3>
              <p>Farmer accepts the best bid. Both parties connect and complete the transaction.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Latest Listings Preview ─── */}
      <section className="marketplace-section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section-header" style={{ marginBottom: 20 }}>
            <div className="section-title">🛒 Latest Listings</div>
            <Link to="/marketplace" className="btn btn-primary btn-sm">See all →</Link>
          </div>
          <div className="listing-grid">
            {listings.map(l => (
              <Link to={`/listing/${l.id}`} key={l.id} className="listing-card" style={{ display: 'block' }}>
                <div className="card-header">
                  <div className="card-emoji">{l.emoji}</div>
                  <div className="card-name">{l.name}</div>
                  <div className="card-meta">
                    <span className="cat-badge">{l.category}</span>
                    <span>·</span>
                    <span>{l.farmerName}</span>
                    {l.farmerLocation && <><span>·</span><span>{l.farmerLocation}</span></>}
                  </div>
                </div>
                <div className="card-body">
                  <div className="card-desc">{l.desc}</div>
                  <div className="card-price">
                    <span className="amount">₹{l.price}</span>
                    <span className="unit">/ {l.unit}</span>
                  </div>
                </div>
                <div className="card-footer">
                  <span className="bid-count">🏷 {l.bidCount} bid{l.bidCount !== 1 ? 's' : ''}</span>
                  {l.topBid && <span className="top-bid">Top: ₹{l.topBid}</span>}
                  <span className="open-badge">Open</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA Strip ─── */}
      <div className="cta-strip">
        <h2>Ready to sell your harvest?</h2>
        <p>Join thousands of farmers already getting better prices on AgroMart.</p>
        <button className="btn-white" onClick={onAuthOpen}>Start for free</button>
      </div>

      {/* ─── Footer ─── */}
      <footer className="footer">
        <div className="footer-brand">🌿 AgroMart</div>
        <p>Connecting farmers and buyers across India · Built with ❤ for the agricultural community</p>
      </footer>
    </>
  );
}
