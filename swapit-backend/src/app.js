require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const listingsRoutes = require('./routes/listings');
const usersRoutes = require('./routes/users');
const categoriesRoutes = require('./routes/categories');
const offersRoutes = require('./routes/offers');
const messagesRoutes = require('./routes/messages');

const app = express();

app.use(cors());
app.use(express.json());

// Serve immagini caricate localmente
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/listings', listingsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/offers', offersRoutes);
app.use('/api/messages', messagesRoutes);

app.get('/', (req, res) => res.json({ message: 'SwapIt API is running 🚀' }));

// Gestione errori globale
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Errore interno del server' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server avviato su http://localhost:${PORT}`));
