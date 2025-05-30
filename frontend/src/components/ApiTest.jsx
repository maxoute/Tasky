import React, { useState, useEffect } from 'react';
import { API_CONFIG } from '../config/api.js';
import axios from 'axios';

const ApiTest = () => {
  const [apiStatus, setApiStatus] = useState('⏳ Test en cours...');
  const [categories, setCategories] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [testResults, setTestResults] = useState([]);

  const api = axios.create(API_CONFIG);

  const runApiTests = async () => {
    const results = [];
    
    try {
      // Test 1: Health check
      console.log('🧪 Test 1: Health check');
      const healthResponse = await api.get('/health');
      results.push({
        test: 'Health Check',
        status: '✅ Succès',
        data: healthResponse.data
      });
    } catch (error) {
      results.push({
        test: 'Health Check',
        status: '❌ Échec',
        error: error.message
      });
    }

    try {
      // Test 2: Catégories
      console.log('🧪 Test 2: Récupération des catégories');
      const categoriesResponse = await api.get('/api/categories');
      setCategories(categoriesResponse.data.categories || []);
      results.push({
        test: 'Catégories',
        status: '✅ Succès',
        data: `${categoriesResponse.data.categories?.length || 0} catégories récupérées`
      });
    } catch (error) {
      results.push({
        test: 'Catégories',
        status: '❌ Échec',
        error: error.message
      });
    }

    try {
      // Test 3: Génération de tâches
      console.log('🧪 Test 3: Génération de tâches');
      const tasksResponse = await api.post('/api/generate_tasks', { theme: 'Test Frontend' });
      setTasks(tasksResponse.data.tasks || []);
      results.push({
        test: 'Génération de tâches',
        status: '✅ Succès',
        data: `${tasksResponse.data.tasks?.length || 0} tâches générées`
      });
    } catch (error) {
      results.push({
        test: 'Génération de tâches',
        status: '❌ Échec',
        error: error.message
      });
    }

    try {
      // Test 4: Liste des tâches
      console.log('🧪 Test 4: Liste des tâches');
      const allTasksResponse = await api.get('/api/tasks');
      results.push({
        test: 'Liste des tâches',
        status: '✅ Succès',
        data: `${allTasksResponse.data?.length || 0} tâches dans la base`
      });
    } catch (error) {
      results.push({
        test: 'Liste des tâches',
        status: '❌ Échec',
        error: error.message
      });
    }

    setTestResults(results);
    
    const successCount = results.filter(r => r.status.includes('✅')).length;
    const totalTests = results.length;
    
    if (successCount === totalTests) {
      setApiStatus(`🎉 Tous les tests réussis (${successCount}/${totalTests})`);
    } else {
      setApiStatus(`⚠️ ${successCount}/${totalTests} tests réussis`);
    }
  };

  useEffect(() => {
    runApiTests();
  }, []);

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">🔧 Test de Communication API</h2>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Configuration API :</h3>
        <div className="bg-gray-100 p-3 rounded">
          <code>{JSON.stringify(API_CONFIG, null, 2)}</code>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Statut :</h3>
        <div className="text-lg font-medium">{apiStatus}</div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Résultats des tests :</h3>
        <div className="space-y-2">
          {testResults.map((result, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <span className="font-medium">{result.test}</span>
              <span>{result.status}</span>
              {result.data && <span className="text-sm text-gray-600">{result.data}</span>}
              {result.error && <span className="text-sm text-red-600">{result.error}</span>}
            </div>
          ))}
        </div>
      </div>

      {categories.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Catégories récupérées :</h3>
          <div className="flex flex-wrap gap-2">
            {categories.map((category, index) => (
              <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                {category}
              </span>
            ))}
          </div>
        </div>
      )}

      {tasks.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Tâches générées :</h3>
          <ul className="space-y-2">
            {tasks.map((task, index) => (
              <li key={index} className="p-2 bg-green-50 rounded border-l-4 border-green-400">
                {task.text || task.title || `Tâche ${task.id}`}
              </li>
            ))}
          </ul>
        </div>
      )}

      <button 
        onClick={runApiTests}
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
      >
        🔄 Relancer les tests
      </button>
    </div>
  );
};

export default ApiTest; 