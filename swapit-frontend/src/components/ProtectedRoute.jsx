import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Questo componente "avvolge" le pagine che richiedono il login.
// Se l'utente non è loggato, lo manda automaticamente alla pagina di login.
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="text-center py-20 text-gray-500">Caricamento...</div>;
  if (!user) return <Navigate to="/login" replace />;

  return children;
}
