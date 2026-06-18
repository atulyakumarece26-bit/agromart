import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../api';

function AddListingModal({ onClose, onAdded }) {
  const [form, setForm] = useState({ name: '', category: 'Grain', qty: '', unit: 'kg', price: '', desc: '', trend: 'stable' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const toast = useToast();

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); setError(''); }

  async function submit(e) {
    e.preventDefault(); setLoading(true);
    try {
      await api.createListing(form);
      toast('Listing added! 🌾');
      onAdded();
      onClose();
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2>Add new listing</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <form onSubmit={submit}>
            <div className="form-group">
              <label className="form-label">Crop name</label>
              <input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Wheat, Tomatoes…" required />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-input" value={form.category} onChange={e => set('category', e.target.value)}>
                  {['Grain','Vegetable','Fruit','Pulse'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Trend</label>
                <select className="form-input" value={form.trend} onChange={e => set('trend', e.target.value)}>
                  <option value="up">↑ Rising</option>
                  <option value="stable">→ Stable</option>
                  <option value="down">↓ Falling</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Quantity</label>
                <input className="form-input" type="number" value={form.qty} onChange={e => set('qty', e.target.value)} placeholder="e.g. 500" required />
              </div>
              <div className="form-group">
                <label className="form-label">Unit</label>
                <select className="form-input" value={form.unit} onChange={e => set('unit', e.target.value)}>
                  {['kg','quintal','tonne','dozen','piece'].map(u => <option key={u}>{u}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Asking price (₹ per {form.unit})</label>
              <input className="form-input" type="number" value={form.price} onChange={e => set('price', e.target.value)} placeholder="e.g. 25" required />
            </div>
            <div className="form-group">
              <label className="form-label">Description (optional)</label>
              <textarea className="form-input" rows={3} value={form.desc} onChange={e => set('desc', e.target.value)} placeholder="Quality notes, harvest date, delivery info…" style={{ resize: 'vertical' }} />
            </div>
            {error && <div className="form-error" style={{ marginBottom: 12 }}>⚠ {error}</div>}
            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>{loading ? 'Adding…' : 'Add listing'}</button>
          </form>
        </div>
      </div>
    </div>
  );
}

function FarmerDash() {
  const [listings, setListings] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const toast = useToast();

  async function load() {
    try { setListings(await api.getMyListings()); } catch {}
  }

  useEffect(() => { load(); }, []);

  async function deleteListing(id) {
    if (!confirm('Delete this listing?')) return;
    try { await api.deleteListing(id); toast('Listing removed'); load(); }
    catch (err) { toast(err.message, 'error'); }
  }

  const openListings = listings.filter(l => l.status === 'open');
  const soldListings = listings.filter(l => l.status === 'sold');
  const totalBids = listings.reduce((s, l) => s + (l.bids?.length || 0), 0);

  return (
    <>
      {showAdd && <AddListingModal onClose={() => setShowAdd(false)} onAdded={load} />}
      <div className="dash-header">
        <div>
          <h1>Farmer Dashboard</h1>
          <p>Manage your crop listings and incoming bids</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ Add listing</button>
      </div>

      <div className="dash-grid">
        <div>
          <div className="card-panel">
            <div className="panel-head"><h3>My Listings</h3><span style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>{listings.length} total</span></div>
            <div className="panel-body">
              {listings.length === 0 && <p style={{ color: 'var(--text-light)', fontSize: '0.88rem' }}>No listings yet. Add your first crop!</p>}
              {listings.map(l => (
                <div key={l.id} className="listing-row">
                  <div className="listing-row-top">
                    <div>
                      <div className="listing-row-name">{l.emoji} {l.name}</div>
                      <div className="listing-row-meta">{l.qty} {l.unit} · ₹{l.price}/{l.unit}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                      {l.status === 'open' ? <span className="open-badge">Open</span> : <span className="sold-badge">Sold</span>}
                      {l.status === 'open' && <button className="btn btn-danger btn-sm" onClick={() => deleteListing(l.id)}>✕</button>}
                    </div>
                  </div>
                  {l.bids && l.bids.length > 0 && (
                    <div className="bids-mini">
                      {[...l.bids].sort((a,b) => b.amount - a.amount).slice(0, 3).map(b => (
                        <div key={b.id} className="bid-item">
                          <div className="bid-info">
                            <div className="bid-buyer">{b.buyerName}</div>
                            {b.message && <div className="bid-msg">{b.message}</div>}
                            {b.status !== 'pending' && <span className={`status-badge status-${b.status}`}>{b.status}</span>}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span className="bid-amount">₹{b.amount}</span>
                            {l.status === 'open' && b.status === 'pending' && (
                              <button className="btn btn-primary btn-sm" onClick={async () => {
                                try { await api.acceptBid(l.id, b.id); toast('Deal done! ✅'); load(); }
                                catch (err) { toast(err.message, 'error'); }
                              }}>Accept</button>
                            )}
                          </div>
                        </div>
                      ))}
                      {l.bids.length > 3 && (
                        <Link to={`/listing/${l.id}`} style={{ fontSize: '0.82rem', color: 'var(--green)' }}>+{l.bids.length - 3} more bids →</Link>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="card-panel" style={{ marginBottom: 16 }}>
            <div className="panel-head"><h3>Summary</h3></div>
            <div className="panel-body">
              <div className="stats-grid">
                <div className="stat-card"><div className="num">{openListings.length}</div><div className="lbl">Open</div></div>
                <div className="stat-card"><div className="num">{soldListings.length}</div><div className="lbl">Sold</div></div>
                <div className="stat-card"><div className="num">{totalBids}</div><div className="lbl">Total bids</div></div>
                <div className="stat-card"><div className="num">{listings.length}</div><div className="lbl">All listings</div></div>
              </div>
              <Link to="/marketplace" className="btn btn-secondary btn-full">View marketplace</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function BuyerDash() {
  const [bids, setBids] = useState([]);

  useEffect(() => { api.getMyBids().then(setBids).catch(() => {}); }, []);

  const won = bids.filter(b => b.status === 'accepted');
  const lost = bids.filter(b => b.status === 'rejected');
  const pending = bids.filter(b => b.status === 'pending');

  return (
    <>
      <div className="dash-header">
        <div>
          <h1>Buyer Dashboard</h1>
          <p>Track your bids and won deals</p>
        </div>
        <Link to="/marketplace" className="btn btn-primary">Browse listings →</Link>
      </div>

      <div className="dash-grid">
        <div>
          <div className="card-panel">
            <div className="panel-head"><h3>My Bids</h3><span style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>{bids.length} total</span></div>
            <div className="panel-body">
              {bids.length === 0 && <p style={{ color: 'var(--text-light)', fontSize: '0.88rem' }}>No bids yet. <Link to="/marketplace" style={{ color: 'var(--green)' }}>Browse the marketplace</Link> to place your first bid.</p>}
              {bids.map(b => (
                <div key={b.id} className="my-bid-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                      <div className="my-bid-crop">{b.listing?.emoji} {b.listing?.name}</div>
                      <div className="my-bid-meta">{b.listing?.farmerName} · ₹{b.amount}/{b.listing?.unit}</div>
                      {b.message && <div style={{ fontSize: '0.82rem', color: 'var(--text-light)', marginTop: 4 }}>{b.message}</div>}
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span className={`status-badge status-${b.status}`}>{b.status}</span>
                      <Link to={`/listing/${b.listingId}`} className="btn btn-outline btn-sm">View →</Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="card-panel">
            <div className="panel-head"><h3>Summary</h3></div>
            <div className="panel-body">
              <div className="stats-grid">
                <div className="stat-card"><div className="num">{won.length}</div><div className="lbl">Won 🎉</div></div>
                <div className="stat-card"><div className="num">{pending.length}</div><div className="lbl">Pending</div></div>
                <div className="stat-card"><div className="num">{lost.length}</div><div className="lbl">Lost</div></div>
                <div className="stat-card"><div className="num">{bids.length}</div><div className="lbl">Total</div></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { if (!user) navigate('/'); }, [user]);
  if (!user) return null;

  return (
    <div className="dashboard-page">
      {user.role === 'farmer' ? <FarmerDash /> : <BuyerDash />}
    </div>
  );
}
