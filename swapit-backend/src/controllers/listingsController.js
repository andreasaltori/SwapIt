const pool = require('../config/db');

// GET /api/listings
const getListings = async (req, res) => {
  const {
    category, min_price, max_price, condition, city, q,
    sort = 'newest', page = 1, limit = 12
  } = req.query;
  const offset = (page - 1) * limit;

  let conditions = ["l.status = 'active'"];
  let params = [];
  let p = 0;

  if (category) { p++; conditions.push(`c.slug = $${p}`); params.push(category); }
  if (min_price) { p++; conditions.push(`l.price >= $${p}`); params.push(min_price); }
  if (max_price) { p++; conditions.push(`l.price <= $${p}`); params.push(max_price); }
  if (condition) { p++; conditions.push(`l.condition = $${p}`); params.push(condition); }
  if (city)      { p++; conditions.push(`l.city ILIKE $${p}`); params.push(`%${city}%`); }
  if (q)         { p++; conditions.push(`(l.title ILIKE $${p} OR l.description ILIKE $${p})`); params.push(`%${q}%`); }

  const orderMap = {
    newest: 'l.created_at DESC',
    oldest: 'l.created_at ASC',
    price_asc: 'l.price ASC',
    price_desc: 'l.price DESC'
  };
  const order = orderMap[sort] || 'l.created_at DESC';
  const where = conditions.join(' AND ');

  try {
    const countRes = await pool.query(
      `SELECT COUNT(*) FROM listings l JOIN categories c ON l.category_id = c.id WHERE ${where}`,
      params
    );

    p++; params.push(limit);
    p++; params.push(offset);

    const result = await pool.query(
      `SELECT l.id, l.title, l.price, l.condition, l.city, l.status, l.created_at,
              c.name AS category_name, c.slug AS category_slug,
              u.username AS seller_username, u.avatar_url AS seller_avatar,
              (SELECT url FROM listing_images WHERE listing_id = l.id ORDER BY position LIMIT 1) AS cover_image
       FROM listings l
       JOIN categories c ON l.category_id = c.id
       JOIN users u ON l.seller_id = u.id
       WHERE ${where}
       ORDER BY ${order}
       LIMIT $${p - 1} OFFSET $${p}`,
      params
    );

    res.json({
      listings: result.rows,
      total: parseInt(countRes.rows[0].count),
      page: parseInt(page),
      pages: Math.ceil(countRes.rows[0].count / limit)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore del server' });
  }
};

// GET /api/listings/:id
const getListing = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('UPDATE listings SET views_count = views_count + 1 WHERE id = $1', [id]);

    const result = await pool.query(
      `SELECT l.*, c.name AS category_name, c.slug AS category_slug,
              u.id AS seller_id, u.username AS seller_username,
              u.avatar_url AS seller_avatar, u.city AS seller_city,
              u.rating_avg AS seller_rating, u.rating_count AS seller_rating_count
       FROM listings l
       JOIN categories c ON l.category_id = c.id
       JOIN users u ON l.seller_id = u.id
       WHERE l.id = $1`,
      [id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Annuncio non trovato' });

    const images = await pool.query(
      'SELECT url, position FROM listing_images WHERE listing_id = $1 ORDER BY position',
      [id]
    );

    res.json({ ...result.rows[0], images: images.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore del server' });
  }
};

// POST /api/listings
const createListing = async (req, res) => {
  const { title, description, price, category_id, condition, city } = req.body;
  if (!title || !price || !category_id || !condition) {
    return res.status(400).json({ error: 'title, price, category_id e condition sono obbligatori' });
  }
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await client.query(
      `INSERT INTO listings (seller_id, category_id, title, description, price, condition, city)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [req.user.id, category_id, title, description || null, price, condition, city || null]
    );
    const listing = result.rows[0];

    if (req.files && req.files.length > 0) {
      for (let i = 0; i < Math.min(req.files.length, 5); i++) {
        await client.query(
          'INSERT INTO listing_images (listing_id, url, position) VALUES ($1, $2, $3)',
          [listing.id, `/uploads/${req.files[i].filename}`, i]
        );
      }
    }
    await client.query('COMMIT');
    res.status(201).json(listing);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Errore del server' });
  } finally {
    client.release();
  }
};

// PUT /api/listings/:id
const updateListing = async (req, res) => {
  const { id } = req.params;
  const { title, description, price, category_id, condition, city, status } = req.body;
  try {
    const check = await pool.query('SELECT seller_id FROM listings WHERE id = $1', [id]);
    if (check.rows.length === 0) return res.status(404).json({ error: 'Annuncio non trovato' });
    if (check.rows[0].seller_id !== req.user.id) return res.status(403).json({ error: 'Non autorizzato' });

    const result = await pool.query(
      `UPDATE listings SET
         title = COALESCE($1, title),
         description = COALESCE($2, description),
         price = COALESCE($3, price),
         category_id = COALESCE($4, category_id),
         condition = COALESCE($5, condition),
         city = COALESCE($6, city),
         status = COALESCE($7, status)
       WHERE id = $8 RETURNING *`,
      [title, description, price, category_id, condition, city, status, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore del server' });
  }
};

// DELETE /api/listings/:id
const deleteListing = async (req, res) => {
  const { id } = req.params;
  try {
    const check = await pool.query('SELECT seller_id FROM listings WHERE id = $1', [id]);
    if (check.rows.length === 0) return res.status(404).json({ error: 'Annuncio non trovato' });
    if (check.rows[0].seller_id !== req.user.id) return res.status(403).json({ error: 'Non autorizzato' });

    await pool.query('DELETE FROM listings WHERE id = $1', [id]);
    res.json({ message: 'Annuncio eliminato con successo' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore del server' });
  }
};

// POST /api/listings/:id/favorite
const toggleFavorite = async (req, res) => {
  const { id } = req.params;
  try {
    const exists = await pool.query(
      'SELECT id FROM favorites WHERE user_id = $1 AND listing_id = $2',
      [req.user.id, id]
    );
    if (exists.rows.length > 0) {
      await pool.query('DELETE FROM favorites WHERE user_id = $1 AND listing_id = $2', [req.user.id, id]);
      res.json({ favorited: false });
    } else {
      await pool.query('INSERT INTO favorites (user_id, listing_id) VALUES ($1, $2)', [req.user.id, id]);
      res.json({ favorited: true });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore del server' });
  }
};

module.exports = { getListings, getListing, createListing, updateListing, deleteListing, toggleFavorite };
