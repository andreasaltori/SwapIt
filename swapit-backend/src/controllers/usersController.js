const pool = require('../config/db');

// GET /api/users/:id - profilo pubblico
const getUser = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT id, username, avatar_url, bio, city, rating_avg, rating_count, created_at
       FROM users WHERE id = $1`,
      [id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Utente non trovato' });

    const listings = await pool.query(
      `SELECT l.id, l.title, l.price, l.condition, l.status, l.created_at,
              (SELECT url FROM listing_images WHERE listing_id = l.id ORDER BY position LIMIT 1) AS cover_image
       FROM listings l WHERE l.seller_id = $1 AND l.status = 'active'
       ORDER BY l.created_at DESC LIMIT 20`,
      [id]
    );

    res.json({ ...result.rows[0], listings: listings.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore del server' });
  }
};

// PUT /api/users/me - aggiorna profilo
const updateMe = async (req, res) => {
  const { bio, city } = req.body;
  try {
    let avatarUrl = undefined;
    if (req.file) avatarUrl = `/uploads/${req.file.filename}`;

    const result = await pool.query(
      `UPDATE users SET
         bio = COALESCE($1, bio),
         city = COALESCE($2, city),
         avatar_url = COALESCE($3, avatar_url)
       WHERE id = $4
       RETURNING id, username, email, avatar_url, bio, city, rating_avg, rating_count`,
      [bio || null, city || null, avatarUrl || null, req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore del server' });
  }
};

// GET /api/users/me/listings
const getMyListings = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT l.id, l.title, l.price, l.condition, l.status, l.created_at, l.views_count,
              c.name AS category_name,
              (SELECT url FROM listing_images WHERE listing_id = l.id ORDER BY position LIMIT 1) AS cover_image
       FROM listings l
       JOIN categories c ON l.category_id = c.id
       WHERE l.seller_id = $1
       ORDER BY l.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore del server' });
  }
};

// GET /api/users/me/favorites
const getMyFavorites = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT l.id, l.title, l.price, l.condition, l.status, l.city, l.created_at,
              u.username AS seller_username,
              (SELECT url FROM listing_images WHERE listing_id = l.id ORDER BY position LIMIT 1) AS cover_image
       FROM favorites f
       JOIN listings l ON f.listing_id = l.id
       JOIN users u ON l.seller_id = u.id
       WHERE f.user_id = $1
       ORDER BY f.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore del server' });
  }
};

module.exports = { getUser, updateMe, getMyListings, getMyFavorites };
