import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function ListingDetail({ onAuthOpen }) {
  const { id } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [bidAmt, setBidAmt] = useState('');
  const [bidMsg, setBidMsg] = useState('');
  const [question, setQuestion] = useState('');
  const [answerDraft, setAnswerDraft] = useState({});
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const l = await api.getListing(id);
      setListing(l);
    } catch { navigate('/marketplace'); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [id]);

  async function placeBid(e) {
    e.preventDefault();
    if (!user) { onAuthOpen(); return; }
    try {
      await api.placeBid({ listingId: id, amount: Number(bidAmt), message: bidMsg });
      toast('Bid placed! 🎉'); setBidAmt(''); setBidMsg('');
      load();
    } catch (err) { toast(err.message, 'error'); }
  }

  async function acceptBid(bidId) {
    try {
      await api.acceptBid(id, bidId);
      toast('Bid accepted! Deal closed ✅');
      load();
    } catch (err) { toast(err.message, 'error'); }
  }

  async function askQuestion(e) {
    e.preventDefault();
    if (!user) { onAuthOpen(); return; }
    try {
      await api.askQuestion({ listingId: id, text: question });
      toast('Question sent!'); setQuestion('');
      load();
    } catch (err) { toast(err.message, 'error'); }
  }

  async function answerQ(qid) {
    try {
      await api.answerQuestion(qid, answerDraft[qid]);
      toast('Answer posted!');
      setAnswerDraft(d => ({ ...d, [qid]: '' }));
      load();
    } catch (err) { toast(err.message, 'error'); }
  }

  if (loading) return <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-light)' }}>Loading…</div>;
  if (!listing) return null;

  const isFarmer = user?.id === listing.farmerId;
  const isBuyer = user && user.role === 'buyer';
  const isOpen = listing.status === 'open';

  return (
    <div className="detail-page">
      <Link to="/marketplace" className="back-link">← Back to marketplace</Link>

      <div className="detail-card">
        <div className="detail-top">
          <div className="detail-emoji">{listing.emoji}</div>
          <div className="detail-info">
            <div className="detail-name">{listing.name}</div>
            <div className="detail-farmer">
              🌾 {listing.farmerName}{listing.farmerLocation ? ` · ${listing.farmerLocation}` : ''}
            </div>
            <div className="detail-desc">{listing.desc}</div>
            <div className="detail-specs">
              <span className="spec-pill">{listing.category}</span>
              <span className="spec-pill">{listing.qty} {listing.unit} available</span>
              {isOpen ? <span className="open-badge">Open</span> : <span className="sold-badge">Sold</span>}
            </div>
          </div>
        </div>
        <div className="detail-price-block">
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Asking price</div>
            <div className="detail-price">₹{listing.price} <span>/ {listing.unit}</span></div>
          </div>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-light)' }}>{listing.bidCount} bid{listing.bidCount !== 1 ? 's' : ''} placed</div>
        </div>
      </div>

      {/* Bidding */}
      {isOpen && isBuyer && (
        <div className="section-card">
          <h3>💰 Place a bid</h3>
          <form onSubmit={placeBid}>
            <div className="form-row" style={{ marginBottom: 10 }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Your offer (₹ / {listing.unit})</label>
                <input className="form-input" type="number" min="1" value={bidAmt} onChange={e => setBidAmt(e.target.value)} placeholder={`e.g. ${listing.price - 2}`} required />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Message (optional)</label>
                <input className="form-input" value={bidMsg} onChange={e => setBidMsg(e.target.value)} placeholder="Quantity you need, pickup info…" />
              </div>
            </div>
            <button type="submit" className="btn btn-amber">Submit bid</button>
          </form>
        </div>
      )}

      {!user && isOpen && (
        <div className="section-card" style={{ textAlign: 'center' }}>
          <p style={{ marginBottom: 12, color: 'var(--text-mid)' }}>Sign in as a buyer to place a bid</p>
          <button className="btn btn-primary" onClick={onAuthOpen}>Sign in / Sign up</button>
        </div>
      )}

      {/* Farmer's bid view */}
      {isFarmer && listing.bids && listing.bids.length > 0 && (
        <div className="section-card">
          <h3>📥 Bids received ({listing.bids.length})</h3>
          {[...listing.bids].sort((a, b) => b.amount - a.amount).map(b => (
            <div key={b.id} className="bid-item" style={{ flexWrap: 'wrap', gap: 10 }}>
              <div className="bid-info">
                <div className="bid-buyer">{b.buyerName}</div>
                {b.message && <div className="bid-msg">{b.message}</div>}
                {b.status !== 'pending' && <span className={`status-badge status-${b.status}`}>{b.status}</span>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className="bid-amount">₹{b.amount}</span>
                {isOpen && b.status === 'pending' && (
                  <button className="btn btn-primary btn-sm" onClick={() => acceptBid(b.id)}>Accept</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Q&A */}
      <div className="section-card">
        <h3>💬 Questions & Answers</h3>
        {listing.questions?.length === 0 && <p style={{ color: 'var(--text-light)', fontSize: '0.88rem', marginBottom: 16 }}>No questions yet. Be the first to ask!</p>}
        {listing.questions?.map(q => (
          <div key={q.id} className="q-item">
            <div className="q-text">❓ {q.text}</div>
            <div className="q-asker">{q.askerName} · {q.askerRole}</div>
            {q.answer && <div className="q-answer">💬 {q.answer}</div>}
            {isFarmer && !q.answer && (
              <div className="q-answer-form">
                <input className="form-input" placeholder="Your answer…" value={answerDraft[q.id] || ''} onChange={e => setAnswerDraft(d => ({ ...d, [q.id]: e.target.value }))} />
                <button className="btn btn-secondary btn-sm" onClick={() => answerQ(q.id)}>Reply</button>
              </div>
            )}
          </div>
        ))}
        {user && !isFarmer && (
          <form onSubmit={askQuestion} style={{ marginTop: 16, display: 'flex', gap: 8 }}>
            <input className="form-input" value={question} onChange={e => setQuestion(e.target.value)} placeholder="Ask the farmer a question…" required />
            <button type="submit" className="btn btn-secondary">Ask</button>
          </form>
        )}
        {!user && (
          <p style={{ marginTop: 12, fontSize: '0.85rem', color: 'var(--text-light)' }}>
            <button style={{ background: 'none', border: 'none', color: 'var(--green)', fontWeight: 600, cursor: 'pointer' }} onClick={onAuthOpen}>Sign in</button> to ask a question
          </p>
        )}
      </div>
    </div>
  );
}
