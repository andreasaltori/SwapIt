const pool = require('../config/db');

// GET /api/messages/:listingId - conversazione su un annuncio
const getMessages = async (req, res) => {
  const { listingId } = req.params;
  const userId = req.user.id;
  try {
    // Verifica che l'utente sia coinvolto (venditore o acquirente)
    const involved = await pool.query(
      `SELECT id FROM messages
       WHERE listing_id = $1 AND (sender_id = $2 OR receiver_id = $2)
       LIMIT 1`,
      [listingId, userId]
    );
    const isOwner = await pool.query(
      'SELECT id FROM listings WHERE id = $1 AND seller_id = $2',
      [listingId, userId]
    );
    if (involved.rows.length === 0 && isOwner.rows.length === 0) {
      return res.status(403).json({ error: 'Non autorizzato' });
    }

    const result = await pool.query(
      `SELECT m.*, u.username AS sender_username, u.avatar_url AS sender_avatar
       FROM messages m
       JOIN users u ON m.sender_id = u.id
       WHERE m.listing_id = $1
         AND (m.sender_id = $2 OR m.receiver_id = $2
              OR EXISTS (SELECT 1 FROM listings WHERE id = $1 AND seller_id = $2))
       ORDER BY m.created_at ASC`,
      [listingId, userId]
    );

    // Segna come letti i messaggi ricevuti
    await pool.query(
      `UPDATE messages SET read_at = NOW()
       WHERE listing_id = $1 AND receiver_id = $2 AND read_at IS NULL`,
      [listingId, userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore del server' });
  }
};

// POST /api/messages
const sendMessage = async (req, res) => {
  const { listing_id, receiver_id, content } = req.body;
  if (!listing_id || !receiver_id || !content) {
    return res.status(400).json({ error: 'listing_id, receiver_id e content sono obbligatori' });
  }
  if (req.user.id === parseInt(receiver_id)) {
    return res.status(400).json({ error: 'Non puoi mandare messaggi a te stesso' });
  }
  try {
    const result = await pool.query(
      `INSERT INTO messages (sender_id, receiver_id, listing_id, content)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [req.user.id, receiver_id, listing_id, content]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore del server' });
  }
};

// GET /api/messages/inbox - lista conversazioni
const getInbox = async (req, res) => {
  const userId = req.user.id;
  try {
    const result = await pool.query(
      `SELECT DISTINCT ON (m.listing_id, LEAST(m.sender_id, m.receiver_id), GREATEST(m.sender_id, m.receiver_id))
              m.id, m.listing_id, m.content, m.created_at, m.read_at,
              l.title AS listing_title,
              (SELECT url FROM listing_images WHERE listing_id = l.id ORDER BY position LIMIT 1) AS listing_image,
              CASE WHEN m.sender_id = $1 THEN m.receiver_id ELSE m.sender_id END AS other_user_id,
              u.username AS other_username, u.avatar_url AS other_avatar,
              (SELECT COUNT(*) FROM messages
               WHERE listing_id = m.listing_id AND receiver_id = $1 AND read_at IS NULL) AS unread_count
       FROM messages m
       JOIN listings l ON m.listing_id = l.id
       JOIN users u ON u.id = CASE WHEN m.sender_id = $1 THEN m.receiver_id ELSE m.sender_id END
       WHERE m.sender_id = $1 OR m.receiver_id = $1
       ORDER BY m.listing_id, LEAST(m.sender_id, m.receiver_id), GREATEST(m.sender_id, m.receiver_id), m.created_at DESC`,
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore del server' });
  }
};

module.exports = { getMessages, sendMessage, getInbox };
