# SwapIt - Backend

API REST per il marketplace di compravendita oggetti usati.

## Setup

### 1. Installa le dipendenze
```bash
npm install
```

### 2. Configura le variabili d'ambiente
```bash
cp .env.example .env
# Modifica .env con i tuoi valori
```

### 3. Crea il database PostgreSQL
```bash
createdb swapit
```

### 4. Inizializza schema e dati di esempio
```bash
npm run db:init
npm run db:seed
```

### 5. Avvia il server
```bash
npm run dev   # sviluppo (con nodemon)
npm start     # produzione
```

Il server parte su `http://localhost:3000`.

## Autenticazione

Tutte le route protette richiedono l'header:
```
Authorization: Bearer <token>
```

Il token si ottiene da `/api/auth/login` o `/api/auth/register`.

## Password utenti seed

Tutti gli utenti di esempio hanno password: `Password123`

## Struttura
```
src/
├── app.js           # Entry point
├── config/db.js     # Connessione PostgreSQL
├── middleware/
│   ├── auth.js      # Verifica JWT
│   └── upload.js    # Upload immagini (Multer)
├── routes/          # Definizione endpoint
└── controllers/     # Logica business
database/
├── schema.sql       # Struttura tabelle
└── seed.sql         # Dati di esempio
```
