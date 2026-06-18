import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import Home from './pages/Home';
import Marketplace from './pages/Marketplace';
import ListingDetail from './pages/ListingDetail';
import Dashboard from './pages/Dashboard';
import './index.css';

export default function App() {
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Navbar onAuthOpen={() => setAuthOpen(true)} />
          {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
          <Routes>
            <Route path="/" element={<Home onAuthOpen={() => setAuthOpen(true)} />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/listing/:id" element={<ListingDetail onAuthOpen={() => setAuthOpen(true)} />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
