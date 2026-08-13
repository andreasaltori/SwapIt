const pool = require('../config/db');

// POST /api/offers
const createOffer = async (req, res) => {
  const { listing_id, amount, message } = req.body;
  if (!listing_id || !amount) {
    return res.status(400).json({ error: 'listing_id e amount sono obbligatori' });
  }
  try {
    const listing = await pool.query('SELECT seller_id, status FROM listings WHERE id = $1', [listing_id]);
    if (listing.rows.length === 0) return res.status(404).json({ error: 'Annuncio non trovato' });
    if (listing.rows[0].status !== 'active') return res.status(400).json({ error: 'Annuncio non disponibile' });
    if (listing.rows[0].seller_id === req.user.id) return res.status(400).json({ error: 'Non puoi fare un\'offerta ai tuoi annunci' });

    const result = await pool.query(
      `INSERT INTO offers (listing_id, buyer_id, amount, message)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [listing_id, req.user.id, amount, message || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore del server' });
  }
};

// PUT /api/offers/:id - accetta o rifiuta
const updateOffer = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // 'accepted' | 'rejected'
  if (!['accepted', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Status deve essere accepted o rejected' });
  }
  try {
    const offer = await pool.query(
      `SELECT o.*, l.seller_id FROM offers o JOIN listings l ON o.listing_id = l.id WHERE o.id = $1`,
      [id]
    );
    if (offer.rows.length === 0) return res.status(404).json({ error: 'Offerta non trovata' });
    if (offer.rows[0].seller_id !== req.user.id) return res.status(403).json({ error: 'Non autorizzato' });
    if (offer.rows[0].status !== 'pending') return res.status(400).json({ error: 'Offerta già gestita' });

    const result = await pool.query(
      'UPDATE offers SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );

    // Se accettata, segna annuncio come riservato
    if (status === 'accepted') {
      await pool.query("UPDATE listings SET status = 'reserved' WHERE id = $1", [offer.rows[0].listing_id]);
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore del server' });
  }
};

// GET /api/offers/listing/:listingId
const getOffersByListing = async (req, res) => {
  const { listingId } = req.params;
  try {
    const listing = await pool.query('SELECT seller_id FROM listings WHERE id = $1', [listingId]);
    if (listing.rows.length === 0) return res.status(404).json({ error: 'Annuncio non trovato' });
    if (listing.rows[0].seller_id !== req.user.id) return res.status(403).json({ error: 'Non autorizzato' });

    const result = await pool.query(
      `SELECT o.*, u.username AS buyer_username, u.avatar_url AS buyer_avatar
       FROM offers o JOIN users u ON o.buyer_id = u.id
       WHERE o.listing_id = $1
       ORDER BY o.created_at DESC`,
      [listingId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore del server' });
  }
};

module.exports = { createOffer, updateOffer, getOffersByListing };
