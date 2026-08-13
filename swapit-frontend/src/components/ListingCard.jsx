import { BASE_URL } from '../api/config';
import { Link } from 'react-router-dom';

// Componente riutilizzabile: mostra un annuncio come "card" (scheda).
// Lo usiamo sia nella Home che nella pagina lista annunci.
export default function ListingCard({ listing }) {
  const conditionLabel = {
    nuovo: { text: 'Nuovo', color: 'bg-green-100 text-green-800' },
    ottimo: { text: 'Ottimo', color: 'bg-blue-100 text-blue-800' },
    buono: { text: 'Buono', color: 'bg-yellow-100 text-yellow-800' },
    usato: { text: 'Usato', color: 'bg-gray-100 text-gray-800' },
  }[listing.condition] || { text: listing.condition, color: 'bg-gray-100 text-gray-800' };

  return (
    <Link to={`/listings/${listing.id}`} className="block group">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
        {/* Immagine */}
        <div className="aspect-square bg-gray-100 overflow-hidden">
          {listing.cover_image ? (
            <img
              src={`${BASE_URL}${listing.cover_image}`}
              alt={listing.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl text-gray-300">
              📦
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3">
          <p className="font-semibold text-gray-800 truncate text-sm">{listing.title}</p>
          <p className="text-blue-600 font-bold text-lg mt-1">€{parseFloat(listing.price).toFixed(2)}</p>
          <div className="flex items-center justify-between mt-2">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${conditionLabel.color}`}>
              {conditionLabel.text}
            </span>
            <span className="text-xs text-gray-400">{listing.city}</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">{listing.seller_username}</p>
        </div>
      </div>
    </Link>
  );
}
