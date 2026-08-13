import { createContext, useContext, useState, useEffect } from 'react';
import { getMe } from '../api/auth';

// AuthContext è il "deposito globale" delle info sull'utente loggato.
// Qualsiasi componente nell'app può leggerlo senza dover passare dati
// attraverso ogni componente intermedio (prop drilling).

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // All'avvio dell'app, controlla se c'è già un token salvato nel browser
  // e se è ancora valido — così l'utente rimane loggato anche dopo un refresh
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      getMe()
        .then((res) => setUser(res.data))
        .catch(() => localStorage.removeItem('token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('token', token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook personalizzato: invece di scrivere useContext(AuthContext) ogni volta,
// basta scrivere useAuth() in qualsiasi componente
export const useAuth = () => useContext(AuthContext);
