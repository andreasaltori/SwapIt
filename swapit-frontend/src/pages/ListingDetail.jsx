import { BASE_URL } from '../api/config';
import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getListing, toggleFavorite, deleteListing } from '../api/listings';
import { createOffer, getOffersByListing, updateOffer } from '../api/offers';
import { sendMessage } from '../api/messages';
import { useAuth } from '../context/AuthContext';

export default function ListingDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [listing, setListing] = useState(null);
  const [currentImg, setCurrentImg] = useState(0);
  const [offers, setOffers] = useState([]);
  const [offerAmount, setOfferAmount] = useState('');
  const [message, setMessage] = useState('');
  const [favorited, setFavorited] = useState(false);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    getListing(id).then((res) => setListing(res.data));
    if (user) {
      getOffersByListing(id)
        .then((res) => setOffers(res.data))
        .catch(() => {}); // non autorizzato = non è il venditore, ignora
    }
  }, [id, user]);

  if (!listing) return <div className="text-center py-20 text-gray-400">Caricamento...</div>;

  const isOwner = user && user.id === listing.seller_id;
  const images = listing.images?.length > 0 ? listing.images : null;

  const handleFavorite = async () => {
    if (!user) return navigate('/login');
    const res = await toggleFavorite(id);
    setFavorited(res.data.favorited);
  };

  const handleOffer = async (e) => {
    e.preventDefault();
    try {
      await createOffer({ listing_id: parseInt(id), amount: parseFloat(offerAmount) });
      setFeedback('Offerta inviata!');
      setOfferAmount('');
    } catch (err) {
      setFeedback(err.response?.data?.error || 'Errore');
    }
  };

  const handleMessage = async (e) => {
    e.preventDefault();
    try {
      await sendMessage({ listing_id: parseInt(id), receiver_id: listing.seller_id, content: message });
      setFeedback('Messaggio inviato!');
      setMessage('');
    } catch {
      setFeedback('Errore invio messaggio');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Eliminare questo annuncio?')) return;
    await deleteListing(id);
    navigate('/profile/me');
  };

  const handleOfferAction = async (offerId, status) => {
    await updateOffer(offerId, status);
    setOffers((prev) => prev.map((o) => o.id === offerId ? { ...o, status } : o));
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Galleria immagini */}
        <div>
          <div className="bg-gray-100 rounded-xl overflow-hidden aspect-square">
            {images ? (
              <img
                src={`${BASE_URL}${images[currentImg].url}`}
                alt={listing.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl text-gray-300">📦</div>
            )}
          </div>
          {images && images.length > 1 && (
            <div className="flex gap-2 mt-3">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentImg(i)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 ${i === currentImg ? 'border-blue-500' : 'border-transparent'}`}
                >
                  <img src={`${BASE_URL}${img.url}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info annuncio */}
        <div>
          <div className="flex items-start justify-between gap-2">
            <h1 className="text-2xl font-bold text-gray-800">{listing.title}</h1>
            <button onClick={handleFavorite} className="text-2xl" title="Aggiungi ai preferiti">
              {favorited ? '❤️' : '🤍'}
            </button>
          </div>

          <p className="text-3xl font-bold text-blue-600 mt-2">€{parseFloat(listing.price).toFixed(2)}</p>

          <div className="flex gap-3 mt-3 text-sm text-gray-500">
            <span className="bg-gray-100 px-3 py-1 rounded-full">{listing.condition}</span>
            <span className="bg-gray-100 px-3 py-1 rounded-full">{listing.category_name}</span>
            <span className="bg-gray-100 px-3 py-1 rounded-full">📍 {listing.city}</span>
          </div>

          <p className="mt-4 text-gray-600 leading-relaxed">{listing.description}</p>

          {/* Venditore */}
          <Link
            to={`/profile/${listing.seller_id}`}
            className="flex items-center gap-3 mt-5 p-3 bg-gray-50 rounded-xl hover:bg-gray-100"
          >
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
              {listing.seller_username?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="font-medium text-gray-800">{listing.seller_username}</p>
              <p className="text-xs text-gray-400">
                ⭐ {listing.seller_rating || '—'} · {listing.seller_city}
              </p>
            </div>
          </Link>

          {feedback && (
            <div className="mt-3 bg-green-50 text-green-700 px-4 py-2 rounded-lg text-sm">{feedback}</div>
          )}

          {/* Azioni per chi NON è il venditore */}
          {user && !isOwner && listing.status === 'active' && (
            <div className="mt-5 space-y-3">
              <form onSubmit={handleOffer} className="flex gap-2">
                <input
                  type="number"
                  value={offerAmount}
                  onChange={(e) => setOfferAmount(e.target.value)}
                  placeholder="Fai un'offerta (€)"
                  min="1"
                  step="0.01"
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm"
                  required
                />
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
                  Offri
                </button>
              </form>

              <form onSubmit={handleMessage} className="flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Scrivi un messaggio al venditore..."
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm"
                  required
                />
                <button type="submit" className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-900">
                  Invia
                </button>
              </form>
            </div>
          )}

          {/* Azioni per il venditore */}
          {isOwner && (
            <div className="mt-5 flex gap-3">
              <Link
                to={`/listings/${id}/edit`}
                className="flex-1 text-center bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 text-sm"
              >
                Modifica
              </Link>
              <button
                onClick={handleDelete}
                className="flex-1 bg-red-50 text-red-600 py-2 rounded-lg hover:bg-red-100 text-sm"
              >
                Elimina
              </button>
            </div>
          )}

          {/* Offerte ricevute (solo venditore) */}
          {isOwner && offers.length > 0 && (
            <div className="mt-6">
              <h3 className="font-bold text-gray-700 mb-3">Offerte ricevute</h3>
              <div className="space-y-2">
                {offers.map((offer) => (
                  <div key={offer.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg text-sm">
                    <div>
                      <span className="font-medium">{offer.buyer_username}</span>
                      <span className="text-blue-600 font-bold ml-2">€{parseFloat(offer.amount).toFixed(2)}</span>
                      {offer.message && <p className="text-gray-400 text-xs mt-1">{offer.message}</p>}
                    </div>
                    {offer.status === 'pending' ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleOfferAction(offer.id, 'accepted')}
                          className="bg-green-100 text-green-700 px-3 py-1 rounded-lg hover:bg-green-200"
                        >
                          Accetta
                        </button>
                        <button
                          onClick={() => handleOfferAction(offer.id, 'rejected')}
                          className="bg-red-100 text-red-600 px-3 py-1 rounded-lg hover:bg-red-200"
                        >
                          Rifiuta
                        </button>
                      </div>
                    ) : (
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        offer.status === 'accepted' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                      }`}>
                        {offer.status === 'accepted' ? 'Accettata' : 'Rifiutata'}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
