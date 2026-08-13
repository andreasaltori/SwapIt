import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getListings } from '../api/listings';
import { getCategories } from '../api/categories';
import ListingCard from '../components/ListingCard';

export default function Home() {
  const [listings, setListings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    getListings({ limit: 8, sort: 'newest' }).then((res) => setListings(res.data.listings));
    getCategories().then((res) =>
      setCategories(res.data.filter((c) => !c.parent_id)) // solo categorie principali
    );
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/listings?q=${encodeURIComponent(search)}`);
  };

  return (
    <div>
      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Compra e vendi oggetti usati
          </h1>
          <p className="text-blue-100 text-lg mb-8">
            Dai nuova vita ai tuoi oggetti. Migliaia di annunci ti aspettano.
          </p>
          <form onSubmit={handleSearch} className="flex max-w-xl mx-auto">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cosa stai cercando?"
              className="flex-1 px-5 py-3 rounded-l-xl text-gray-800 text-lg focus:outline-none"
            />
            <button
              type="submit"
              className="bg-blue-900 hover:bg-blue-950 px-6 py-3 rounded-r-xl font-semibold text-lg"
            >
              Cerca
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Categorie */}
        <h2 className="text-xl font-bold text-gray-800 mb-4">Sfoglia per categoria</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-3 mb-12">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/listings?category=${cat.slug}`}
              className="flex flex-col items-center gap-1 bg-white border border-gray-100 rounded-xl p-3 hover:border-blue-300 hover:shadow-sm transition text-center"
            >
              <span className="text-2xl">{cat.icon}</span>
              <span className="text-xs text-gray-600 font-medium">{cat.name}</span>
              <span className="text-xs text-gray-400">{cat.listing_count}</span>
            </Link>
          ))}
        </div>

        {/* Ultimi annunci */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">Ultimi arrivi</h2>
          <Link to="/listings" className="text-blue-600 hover:underline text-sm">
            Vedi tutti →
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {listings.map((l) => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>
      </div>
    </div>
  );
}
