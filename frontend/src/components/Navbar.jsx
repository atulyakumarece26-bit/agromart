import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ onAuthOpen }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <span className="logo-icon">🌿</span>
          AgroMart
        </Link>
        <div className="navbar-links">
          <Link to="/" className={`nav-link ${path === '/' ? 'active' : ''}`}>Home</Link>
          <Link to="/marketplace" className={`nav-link ${path === '/marketplace' ? 'active' : ''}`}>Marketplace</Link>
          {user ? (
            <>
              <Link to="/dashboard" className={`nav-link ${path === '/dashboard' ? 'active' : ''}`}>Dashboard</Link>
              <button className="btn btn-outline btn-sm" onClick={handleLogout}>Sign out</button>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-light)', padding: '0 4px' }}>Hi, {user.name.split(' ')[0]}</span>
            </>
          ) : (
            <button className="btn btn-primary btn-sm" onClick={onAuthOpen}>Sign in</button>
          )}
        </div>
      </div>
    </nav>
  );
}
