// Test de l'API pour vérifier les routes
import axios from 'axios';

const API_URL = 'http://localhost:8000';

const testApi = async () => {
  try {
    console.log('Test 1: Vérification de la santé du serveur');
    const healthResponse = await axios.get(`${API_URL}/api/health`);
    console.log('Résultat santé:', healthResponse.data);
    
    console.log('Test 2: Récupération des catégories');
    const categoriesResponse = await axios.get(`${API_URL}/api/categories`);
    console.log('Résultat catégories:', categoriesResponse.data);
    
    console.log('Test 3: Génération de tâches simples');
    const generateResponse = await axios.post(`${API_URL}/api/generate_tasks`, {
      theme: 'Test API'
    });
    console.log('Résultat génération simple:', generateResponse.data);
    
    console.log('Test 4: Génération de tâches avec OpenAI');
    const openaiResponse = await axios.post(`${API_URL}/api/generate`, {
      theme: 'Test API OpenAI', 
      is_smart_objective: false
    });
    console.log('Résultat génération OpenAI:', openaiResponse.data);
    
    console.log('Tous les tests ont réussi!');
  } catch (error) {
    console.error('Erreur lors des tests:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
  }
};

// Exécuter les tests
console.log('Démarrage des tests API...');
testApi();

export default testApi; 