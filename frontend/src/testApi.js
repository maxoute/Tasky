import axios from 'axios';

// Configuration des endpoints à tester
const API_BASE_URL = '';  // Utiliser URL relative pour le proxy ou http://localhost:8000 pour test direct

// Fonction qui teste un endpoint d'API et renvoie le résultat
const testEndpoint = async (method, url, data = null, name = url) => {
  try {
    console.log(`\n🧪 Test: ${name}`);
    console.log(`📡 ${method.toUpperCase()} ${url}`);
    
    if (data) {
      console.log('📦 Données:', JSON.stringify(data, null, 2));
    }
    
    const config = {
      method,
      url: `${API_BASE_URL}${url}`,
      headers: {
        'Content-Type': 'application/json'
      },
      data: data || undefined,
      timeout: 5000
    };
    
    const startTime = Date.now();
    const response = await axios(config);
    const duration = Date.now() - startTime;
    
    console.log('✅ Succès!');
    console.log(`⏱️ Durée: ${duration}ms`);
    console.log('📊 Réponse:', JSON.stringify(response.data, null, 2));
    
    return { success: true, data: response.data, duration };
  } catch (error) {
    console.error('❌ Échec!');
    
    const errorDetails = {
      url: error.config?.url || 'URL inconnue',
      method: error.config?.method?.toUpperCase() || 'MÉTHODE INCONNUE',
      status: error.response?.status || 'Pas de statut',
      statusText: error.response?.statusText || 'Texte de statut inconnu',
      message: error.message || "Message d'erreur inconnu",
      data: error.response?.data || {}
    };
    
    console.error('🔍 Détails:', JSON.stringify(errorDetails, null, 2));
    
    return { success: false, error: errorDetails };
  }
};

// Exécution des tests
async function runTests() {
  console.log('🚀 DÉMARRAGE DES TESTS API');
  console.log('==========================');
  
  // Test de la santé de l'API
  await testEndpoint('get', '/api/health', null, 'Santé de l\'API');
  
  // Test des routes de tâches
  await testEndpoint('get', '/api/categories', null, 'Récupération des catégories');
  await testEndpoint('post', '/api/generate_tasks', { theme: 'API Testing' }, 'Génération simple de tâches');
  
  // Test des routes d'habitudes
  await testEndpoint('get', '/api/habits?user_id=test_user', null, 'Récupération des habitudes');
  await testEndpoint('post', '/api/habits', { 
    user_id: 'test_user',
    name: 'Test Habit',
    description: 'Habitude de test', 
    frequency: 'daily'
  }, 'Création d\'une habitude');
  
  console.log('\n==========================');
  console.log('🏁 FIN DES TESTS API');
}

// Lancement des tests
runTests();

export default runTests; 