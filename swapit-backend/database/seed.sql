-- SwapIt - Dati di esempio
-- Eseguire DOPO schema.sql: psql $DATABASE_URL -f database/seed.sql

-- Categorie principali
INSERT INTO categories (name, slug, icon) VALUES
  ('Elettronica',     'elettronica',     '📱'),
  ('Abbigliamento',   'abbigliamento',   '👕'),
  ('Casa e arredo',   'casa-arredo',     '🛋️'),
  ('Sport e hobby',   'sport-hobby',     '⚽'),
  ('Libri e giochi',  'libri-giochi',    '📚'),
  ('Auto e moto',     'auto-moto',       '🚗'),
  ('Altro',           'altro',           '📦');

-- Sottocategorie Elettronica
INSERT INTO categories (name, slug, icon, parent_id) VALUES
  ('Smartphone',  'smartphone',  '📱', (SELECT id FROM categories WHERE slug='elettronica')),
  ('Laptop',      'laptop',      '💻', (SELECT id FROM categories WHERE slug='elettronica')),
  ('Audio',       'audio',       '🎧', (SELECT id FROM categories WHERE slug='elettronica'));

-- Utenti di esempio (password: Password123 per tutti)
INSERT INTO users (username, email, password_hash, city, bio) VALUES
  ('marco_v',   'marco@example.com',   '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'Milano',  'Vendo per fare spazio, tutto in ottimo stato!'),
  ('giulia_r',  'giulia@example.com',  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'Roma',    'Appassionata di moda e vintage.'),
  ('luca_b',    'luca@example.com',    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'Torino',  'Tecnico informatico, vendo gadget e accessori.'),
  ('sara_m',    'sara@example.com',    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'Napoli',  'Amante dei libri e dei giochi da tavolo.'),
  ('andrea_c',  'andrea@example.com',  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'Firenze', 'Sportivo, vendo attrezzatura usata pochissimo.');

-- Annunci
INSERT INTO listings (seller_id, category_id, title, description, price, condition, city) VALUES
  (1, (SELECT id FROM categories WHERE slug='smartphone'),   'iPhone 13 128GB - Nero',          'Perfetto, nessun graffio. Completo di scatola e accessori originali. Batteria al 94%.', 499.00, 'ottimo', 'Milano'),
  (1, (SELECT id FROM categories WHERE slug='laptop'),       'MacBook Air M1 2020',             'Usato con cura per 2 anni. SSD 256GB, 8GB RAM. Copre il normale uso quotidiano.', 750.00, 'buono', 'Milano'),
  (2, (SELECT id FROM categories WHERE slug='abbigliamento'),'Giacca in pelle vintage - Tg. M', 'Giacca anni ''90 in vera pelle marrone. Taglia M, ottima vestibilità.', 85.00, 'buono', 'Roma'),
  (2, (SELECT id FROM categories WHERE slug='abbigliamento'),'Borsa Louis Vuitton (autentica)',  'Acquistata nel 2019, usata poche volte. Certificato di autenticità incluso.', 420.00, 'ottimo', 'Roma'),
  (3, (SELECT id FROM categories WHERE slug='audio'),        'Cuffie Sony WH-1000XM4',          'Noise cancelling top di gamma. Usate 6 mesi, come nuove. Con custodia originale.', 180.00, 'ottimo', 'Torino'),
  (3, (SELECT id FROM categories WHERE slug='elettronica'),  'Nintendo Switch OLED + 3 giochi', 'Switch OLED bianca, acquistata a marzo 2023. Include Mario Kart, Zelda e Pokemon.', 290.00, 'ottimo', 'Torino'),
  (4, (SELECT id FROM categories WHERE slug='libri-giochi'), 'Lotto 20 libri fantasy',          'Tolkien, Sanderson, Martin, Sapkowski. Tutti in ottimo stato, prezzi segnati cancellati.', 45.00, 'buono', 'Napoli'),
  (4, (SELECT id FROM categories WHERE slug='libri-giochi'), 'Catan + espansioni',              'Gioco base + espansione "Marinai" e "Città e Cavalieri". Completi e perfetti.', 60.00, 'ottimo', 'Napoli'),
  (5, (SELECT id FROM categories WHERE slug='sport-hobby'),  'Bicicletta da corsa Trek Domane', 'Taglia 54cm, gruppo Shimano 105. Tagliando fatto a marzo. Cerchi in carbonio.', 1200.00, 'buono', 'Firenze'),
  (5, (SELECT id FROM categories WHERE slug='sport-hobby'),  'Racchette tennis Wilson x2',      'Coppia di racchette Wilson Blade 98. Grip nuovi, cordatura recente.', 150.00, 'ottimo', 'Firenze'),
  (1, (SELECT id FROM categories WHERE slug='casa-arredo'),  'Lampada Artemide Tolomeo',        'Design iconico, funziona perfettamente. Qualche segno d''uso sulla base.', 120.00, 'buono', 'Milano'),
  (3, (SELECT id FROM categories WHERE slug='smartphone'),   'Samsung Galaxy S23 Ultra',        'Blu, 256GB, con S-Pen. Pellicola protettiva dal primo giorno. Perfetto.', 650.00, 'ottimo', 'Torino');

-- Aggiorna views casuali
UPDATE listings SET views_count = floor(random() * 200 + 10)::int;
