const pool = require('../config/db');

const getCategories = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.id, c.name, c.slug, c.icon, c.parent_id,
              COUNT(l.id)::int AS listing_count
       FROM categories c
       LEFT JOIN listings l ON l.category_id = c.id AND l.status = 'active'
       GROUP BY c.id
       ORDER BY c.parent_id NULLS FIRST, c.name`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore del server' });
  }
};

module.exports = { getCategories };
