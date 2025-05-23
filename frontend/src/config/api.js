// Configuration API selon l'environnement
const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

export const API_CONFIG = {
  baseURL: isDevelopment 
    ? 'http://localhost:8001'  // Development sur ton Mac
    : `http://${window.location.hostname}:8001`,  // Production sur VM (utilise la même IP que le frontend)
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
};

console.log('🔧 Configuration API:', API_CONFIG); 