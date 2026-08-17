# Dockerfile — istruzioni per costruire il contenitore del backend SwapIt
#
# Un Dockerfile è come una ricetta: descrive passo per passo come preparare
# l'ambiente in cui gira l'applicazione. Chiunque abbia Docker può eseguire
# questo file e ottenere esattamente lo stesso ambiente, su qualsiasi macchina.

# STEP 1: partiamo da un'immagine base ufficiale di Node.js
# "alpine" è una versione Linux minimale e leggera (~5MB invece di ~900MB)
FROM node:20-alpine

# STEP 2: creiamo e impostiamo la cartella di lavoro dentro il contenitore
WORKDIR /app

# STEP 3: copiamo prima solo package.json e package-lock.json
# Questo trucco sfrutta la cache di Docker: se le dipendenze non cambiano,
# non le reinstalla ad ogni build — risparmia molto tempo
COPY package*.json ./

# STEP 4: installiamo le dipendenze (solo quelle di produzione)
RUN npm install --production

# STEP 5: copiamo tutto il resto del codice sorgente
COPY . .

# STEP 6: creiamo la cartella uploads (necessaria per le immagini)
RUN mkdir -p uploads

# STEP 7: esponiamo la porta su cui gira il server
EXPOSE 3000

# STEP 8: il comando che avvia l'applicazione quando il contenitore parte
CMD ["node", "src/app.js"]
