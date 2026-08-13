import axios from 'axios';

// L'URL base del nostro backend. Quando andremo in produzione, cambieremo questo valore.
const API_URL = 'http://localhost:3000/api';

const client = axios.create({
  baseURL: API_URL,
});

// Interceptor: prima di ogni richiesta, aggiungi automaticamente il token JWT
// nell'header Authorization — così non dobbiamo farlo a mano ogni volta
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default client;
