-- SwapIt - Schema del database
-- Eseguire con: psql $DATABASE_URL -f database/schema.sql

DROP TABLE IF EXISTS reviews, favorites, messages, offers, listing_images, listings, categories, users CASCADE;

-- Utenti
CREATE TABLE users (
  id            SERIAL PRIMARY KEY,
  username      VARCHAR(50) UNIQUE NOT NULL,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  avatar_url    TEXT,
  bio           TEXT,
  city          VARCHAR(100),
  rating_avg    DECIMAL(2,1) DEFAULT 0,
  rating_count  INTEGER DEFAULT 0,
  created_at    TIMESTAMP DEFAULT NOW()
);

-- Categorie (con supporto sottocategorie)
CREATE TABLE categories (
  id        SERIAL PRIMARY KEY,
  name      VARCHAR(100) NOT NULL,
  slug      VARCHAR(100) UNIQUE NOT NULL,
  icon      VARCHAR(50),
  parent_id INTEGER REFERENCES categories(id) ON DELETE SET NULL
);

-- Annunci
CREATE TABLE listings (
  id          SERIAL PRIMARY KEY,
  seller_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id INTEGER NOT NULL REFERENCES categories(id),
  title       VARCHAR(200) NOT NULL,
  description TEXT,
  price       DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  condition   VARCHAR(20) NOT NULL CHECK (condition IN ('nuovo','ottimo','buono','usato')),
  city        VARCHAR(100),
  status      VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active','sold','reserved')),
  views_count INTEGER DEFAULT 0,
  created_at  TIMESTAMP DEFAULT NOW()
);

-- Immagini degli annunci (max 5)
CREATE TABLE listing_images (
  id         SERIAL PRIMARY KEY,
  listing_id INTEGER NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  url        TEXT NOT NULL,
  position   INTEGER NOT NULL DEFAULT 0,
  UNIQUE (listing_id, position)
);

-- Offerte
CREATE TABLE offers (
  id         SERIAL PRIMARY KEY,
  listing_id INTEGER NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  buyer_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount     DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  message    TEXT,
  status     VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','rejected')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Messaggi
CREATE TABLE messages (
  id          SERIAL PRIMARY KEY,
  sender_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  listing_id  INTEGER NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  content     TEXT NOT NULL,
  read_at     TIMESTAMP,
  created_at  TIMESTAMP DEFAULT NOW()
);

-- Preferiti
CREATE TABLE favorites (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  listing_id INTEGER NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (user_id, listing_id)
);

-- Valutazioni
CREATE TABLE reviews (
  id          SERIAL PRIMARY KEY,
  listing_id  INTEGER NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  reviewer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reviewed_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating      INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment     TEXT,
  created_at  TIMESTAMP DEFAULT NOW(),
  UNIQUE (listing_id, reviewer_id)
);

-- Indici per performance
CREATE INDEX idx_listings_seller   ON listings(seller_id);
CREATE INDEX idx_listings_category ON listings(category_id);
CREATE INDEX idx_listings_status   ON listings(status);
CREATE INDEX idx_messages_listing  ON messages(listing_id);
CREATE INDEX idx_offers_listing    ON offers(listing_id);
CREATE INDEX idx_favorites_user    ON favorites(user_id);
