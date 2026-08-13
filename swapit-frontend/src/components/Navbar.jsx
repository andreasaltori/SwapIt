import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-blue-600 text-white shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold tracking-tight hover:text-blue-100">
          SwapIt
        </Link>

        {/* Barra di ricerca veloce */}
        <form
          className="hidden md:flex flex-1 mx-8"
          onSubmit={(e) => {
            e.preventDefault();
            const q = e.target.q.value.trim();
            if (q) navigate(`/listings?q=${encodeURIComponent(q)}`);
          }}
        >
          <input
            name="q"
            type="text"
            placeholder="Cerca oggetti..."
            className="w-full px-4 py-2 rounded-l-lg text-gray-800 focus:outline-none"
          />
          <button
            type="submit"
            className="bg-blue-800 px-4 py-2 rounded-r-lg hover:bg-blue-900"
          >
            🔍
          </button>
        </form>

        {/* Menu utente */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link
                to="/listings/new"
                className="bg-white text-blue-600 font-semibold px-4 py-2 rounded-lg hover:bg-blue-50 text-sm"
              >
                + Vendi
              </Link>
              <Link to="/messages" className="hover:text-blue-200 text-sm">
                💬 Messaggi
              </Link>
              <Link to="/profile/me" className="hover:text-blue-200 text-sm">
                👤 {user.username}
              </Link>
              <button
                onClick={handleLogout}
                className="hover:text-blue-200 text-sm"
              >
                Esci
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-blue-200 text-sm">
                Accedi
              </Link>
              <Link
                to="/register"
                className="bg-white text-blue-600 font-semibold px-4 py-2 rounded-lg hover:bg-blue-50 text-sm"
              >
                Registrati
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
