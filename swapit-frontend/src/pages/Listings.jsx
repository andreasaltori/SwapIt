import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getListings } from '../api/listings';
import { getCategories } from '../api/categories';
import ListingCard from '../components/ListingCard';

export default function Listings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [listings, setListings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Leggi i filtri dall'URL
  const filters = {
    q: searchParams.get('q') || '',
    category: searchParams.get('category') || '',
    min_price: searchParams.get('min_price') || '',
    max_price: searchParams.get('max_price') || '',
    condition: searchParams.get('condition') || '',
    sort: searchParams.get('sort') || 'newest',
  };

  useEffect(() => {
    getCategories().then((res) => setCategories(res.data.filter((c) => !c.parent_id)));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = { ...filters, page, limit: 12 };
    Object.keys(params).forEach((k) => !params[k] && delete params[k]);
    getListings(params)
      .then((res) => {
        setListings(res.data.listings);
        setTotal(res.data.total);
        setPages(res.data.pages);
      })
      .finally(() => setLoading(false));
  }, [searchParams, page]);

  const updateFilter = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
    setPage(1);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 flex gap-6">
      {/* Sidebar filtri */}
      <aside className="hidden md:block w-56 shrink-0">
        <div className="bg-white rounded-xl border border-gray-100 p-4 sticky top-4">
          <h3 className="font-bold text-gray-700 mb-3">Filtri</h3>

          <div className="mb-4">
            <label className="text-xs text-gray-500 font-medium uppercase">Categoria</label>
            <select
              value={filters.category}
              onChange={(e) => updateFilter('category', e.target.value)}
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">Tutte</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="text-xs text-gray-500 font-medium uppercase">Prezzo</label>
            <div className="flex gap-2 mt-1">
              <input
                type="number"
                placeholder="Min"
                value={filters.min_price}
                onChange={(e) => updateFilter('min_price', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm"
              />
              <input
                type="number"
                placeholder="Max"
                value={filters.max_price}
                onChange={(e) => updateFilter('max_price', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="text-xs text-gray-500 font-medium uppercase">Condizione</label>
            {['nuovo', 'ottimo', 'buono', 'usato'].map((c) => (
              <label key={c} className="flex items-center gap-2 mt-1 text-sm cursor-pointer">
                <input
                  type="radio"
                  name="condition"
                  value={c}
                  checked={filters.condition === c}
                  onChange={() => updateFilter('condition', c)}
                />
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </label>
            ))}
            {filters.condition && (
              <button
                onClick={() => updateFilter('condition', '')}
                className="text-xs text-blue-500 mt-1 hover:underline"
              >
                Rimuovi filtro
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Contenuto principale */}
      <div className="flex-1">
        <div className="flex items-center justify-between mb-4">
          <p className="text-gray-500 text-sm">
            {loading ? 'Caricamento...' : `${total} annunci trovati`}
            {filters.q && <span className="font-medium"> per "{filters.q}"</span>}
          </p>
          <select
            value={filters.sort}
            onChange={(e) => updateFilter('sort', e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
          >
            <option value="newest">Più recenti</option>
            <option value="price_asc">Prezzo: crescente</option>
            <option value="price_desc">Prezzo: decrescente</option>
          </select>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400">Caricamento...</div>
        ) : listings.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-4xl mb-3">🔍</p>
            <p>Nessun annuncio trovato con questi filtri.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {listings.map((l) => <ListingCard key={l.id} listing={l} />)}
          </div>
        )}

        {/* Paginazione */}
        {pages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-9 h-9 rounded-lg text-sm font-medium ${
                  p === page ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
