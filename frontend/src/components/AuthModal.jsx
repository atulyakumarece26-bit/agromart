import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../api';

export default function AuthModal({ onClose }) {
  const [tab, setTab] = useState('login');
  const [form, setForm] = useState({ name: '', username: '', password: '', role: 'buyer', location: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const toast = useToast();

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); setError(''); }

  async function submit(e) {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const data = tab === 'login'
        ? await api.login({ username: form.username, password: form.password })
        : await api.signup(form);
      login(data.token, data.user);
      toast(`Welcome, ${data.user.name}! 🌿`);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2>{tab === 'login' ? 'Welcome back' : 'Join AgroMart'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="tab-row">
            <button className={`tab-btn ${tab === 'login' ? 'active' : ''}`} onClick={() => { setTab('login'); setError(''); }}>Sign in</button>
            <button className={`tab-btn ${tab === 'signup' ? 'active' : ''}`} onClick={() => { setTab('signup'); setError(''); }}>Sign up</button>
          </div>

          <form onSubmit={submit}>
            {tab === 'signup' && (
              <>
                <div className="form-group">
                  <label className="form-label">Full name</label>
                  <input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Your full name" required />
                </div>
                <div className="form-group">
                  <label className="form-label">I am a</label>
                  <div className="tab-row">
                    <button type="button" className={`tab-btn ${form.role === 'buyer' ? 'active' : ''}`} onClick={() => set('role', 'buyer')}>🛒 Buyer</button>
                    <button type="button" className={`tab-btn ${form.role === 'farmer' ? 'active' : ''}`} onClick={() => set('role', 'farmer')}>🌾 Farmer</button>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Location (optional)</label>
                  <input className="form-input" value={form.location} onChange={e => set('location', e.target.value)} placeholder="City, State" />
                </div>
              </>
            )}
            <div className="form-group">
              <label className="form-label">Username</label>
              <input className="form-input" value={form.username} onChange={e => set('username', e.target.value)} placeholder="Enter username" required autoFocus />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" type="password" value={form.password} onChange={e => set('password', e.target.value)} placeholder="Enter password" required />
            </div>
            {error && <div className="form-error" style={{ marginBottom: 12 }}>⚠ {error}</div>}
            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? 'Please wait…' : tab === 'login' ? 'Sign in' : 'Create account'}
            </button>
          </form>

          {tab === 'login' && (
            <p style={{ fontSize: '0.8rem', color: 'var(--text-light)', marginTop: 14, textAlign: 'center' }}>
              Demo: <strong>ramlal</strong> / farmer123 &nbsp;·&nbsp; <strong>priya</strong> / buyer123
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
