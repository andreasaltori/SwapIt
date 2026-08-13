import { BASE_URL } from '../api/config';
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getUser } from '../api/users';
import { getMyListings, getMyFavorites } from '../api/users';
import { getMe } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import ListingCard from '../components/ListingCard';

export default function Profile() {
  const { id } = useParams(); // 'me' oppure un ID numerico
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [listings, setListings] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [tab, setTab] = useState('listings');

  const isMe = id === 'me';

  useEffect(() => {
    if (isMe) {
      getMe().then((res) => setProfile(res.data));
      getMyListings().then((res) => setListings(res.data));
      getMyFavorites().then((res) => setFavorites(res.data));
    } else {
      getUser(id).then((res) => {
        setProfile(res.data);
        setListings(res.data.listings || []);
      });
    }
  }, [id]);

  if (!profile) return <div className="text-center py-20 text-gray-400">Caricamento...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header profilo */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex items-center gap-5 mb-6">
        <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-3xl text-blue-600 font-bold shrink-0">
          {profile.avatar_url
            ? <img src={`${BASE_URL}${profile.avatar_url}`} className="w-full h-full rounded-full object-cover" />
            : profile.username?.[0]?.toUpperCase()
          }
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-800">{profile.username}</h1>
          <p className="text-gray-400 text-sm">{profile.city}</p>
          {profile.bio && <p className="text-gray-600 text-sm mt-1">{profile.bio}</p>}
          <div className="flex gap-4 mt-2 text-sm text-gray-500">
            <span>⭐ {profile.rating_avg || '—'} ({profile.rating_count} voti)</span>
            <span>📅 Membro dal {new Date(profile.created_at).toLocaleDateString('it-IT', { month: 'long', year: 'numeric' })}</span>
          </div>
        </div>
        {isMe && (
          <Link to="/profile/me/edit" className="text-sm text-blue-600 hover:underline shrink-0">
            Modifica profilo
          </Link>
        )}
      </div>

      {/* Tab */}
      <div className="flex gap-4 border-b border-gray-100 mb-6">
        <button
          onClick={() => setTab('listings')}
          className={`pb-3 text-sm font-medium border-b-2 transition ${tab === 'listings' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}
        >
          Annunci ({listings.length})
        </button>
        {isMe && (
          <button
            onClick={() => setTab('favorites')}
            className={`pb-3 text-sm font-medium border-b-2 transition ${tab === 'favorites' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}
          >
            Preferiti ({favorites.length})
          </button>
        )}
      </div>

      {/* Contenuto tab */}
      {tab === 'listings' && (
        listings.length === 0
          ? <p className="text-center text-gray-400 py-10">Nessun annuncio pubblicato.</p>
          : <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {listings.map((l) => <ListingCard key={l.id} listing={{ ...l, seller_username: profile.username }} />)}
            </div>
      )}
      {tab === 'favorites' && (
        favorites.length === 0
          ? <p className="text-center text-gray-400 py-10">Nessun preferito salvato.</p>
          : <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {favorites.map((l) => <ListingCard key={l.id} listing={l} />)}
            </div>
      )}
    </div>
  );
}
