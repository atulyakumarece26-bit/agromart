import { createContext, useContext, useState, useEffect } from 'react';

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('agro_user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  function login(token, userData) {
    localStorage.setItem('agro_token', token);
    localStorage.setItem('agro_user', JSON.stringify(userData));
    setUser(userData);
  }

  function logout() {
    localStorage.removeItem('agro_token');
    localStorage.removeItem('agro_user');
    setUser(null);
  }

  return <AuthCtx.Provider value={{ user, login, logout }}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);
