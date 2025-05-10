import axios from 'axios';

// Création d'une instance axios configurée
const api = axios.create({
  baseURL: 'http://localhost:8000',  // Pointer directement vers le backend FastAPI
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Intercepteurs pour la gestion des erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log détaillé de l'erreur
    const errorDetails = {
      url: error.config?.url || 'URL inconnue',
      method: error.config?.method?.toUpperCase() || 'MÉTHODE INCONNUE',
      status: error.response?.status || 'Pas de statut',
      statusText: error.response?.statusText || 'Texte de statut inconnu',
      message: error.message || "Message d'erreur inconnu",
      data: error.response?.data || {}
    };
    
    console.error('Erreur API détectée:', errorDetails);
    
    // Rejeter la promesse pour que le composant puisse gérer l'erreur
    return Promise.reject(error);
  }
);

// Services API
export const themeService = {
  generateTasks: async (theme, options = {}) => {
    try {
      console.log("Tentative de génération de tâches pour:", theme);
      
      // Appel API au backend
      try {
        const response = await api.post('/api/generate', { theme, ...options });
        console.log("Génération des tâches réussie via /api/generate");
        return {
          theme: theme,
          tasks: response.data.tasks || []
        };
      } catch (primaryError) {
        console.log('Endpoint principal a échoué, tentative sur l\'endpoint secondaire', primaryError);
        
        try {
          const fallbackResponse = await api.post('/api/generate_tasks', { theme });
          console.log("Génération des tâches réussie via /api/generate_tasks");
          return {
            theme: theme,
            tasks: fallbackResponse.data.tasks || []
          };
        } catch (secondaryError) {
          console.log('Endpoint secondaire a également échoué, génération de tâches locales', secondaryError);
          
          // Générer des tâches localement comme solution de dernier recours
          console.log("Génération de tâches locales pour:", theme);
          const localTasks = [
            { 
              id: 'local-1', 
              text: `Faire des recherches sur "${theme}"`,
              hashtags: ["recherche", "préparation"],
              eisenhower: "important_not_urgent",
              estimated_time: "30min",
              deadline: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Demain
              completed: false 
            },
            { 
              id: 'local-2', 
              text: `Créer un plan d'action pour "${theme}"`,
              hashtags: ["planification", "organisation"],
              eisenhower: "important_urgent",
              estimated_time: "1h",
              deadline: new Date(Date.now() + 172800000).toISOString().split('T')[0], // Dans 2 jours
              completed: false 
            },
            { 
              id: 'local-3', 
              text: `Évaluer les ressources nécessaires pour "${theme}"`,
              hashtags: ["ressources", "budget"],
              eisenhower: "important_not_urgent",
              estimated_time: "45min",
              deadline: new Date(Date.now() + 259200000).toISOString().split('T')[0], // Dans 3 jours
              completed: false 
            },
            { 
              id: 'local-4', 
              text: `Définir des objectifs mesurables pour "${theme}"`,
              hashtags: ["objectifs", "smart"],
              eisenhower: "important_urgent",
              estimated_time: "40min",
              deadline: new Date(Date.now() + 345600000).toISOString().split('T')[0], // Dans 4 jours
              completed: false 
            },
            { 
              id: 'local-5', 
              text: `Partager les progrès concernant "${theme}"`,
              hashtags: ["communication", "suivi"],
              eisenhower: "not_important_not_urgent",
              estimated_time: "20min",
              deadline: new Date(Date.now() + 432000000).toISOString().split('T')[0], // Dans 5 jours
              completed: false 
            }
          ];
          
          return {
            theme: theme,
            tasks: localTasks
          };
        }
      }
      
    } catch (error) {
      console.error('Erreur lors de la génération des tâches:', error);
      // Retourner un objet avec la structure attendue même en cas d'erreur
      return {
        theme: theme,
        tasks: [
          { id: 'fallback-1', text: `Rechercher sur ${theme}`, completed: false },
          { id: 'fallback-2', text: `Créer un plan pour ${theme}`, completed: false },
          { id: 'fallback-3', text: `Discuter de ${theme} avec un ami`, completed: false }
        ]
      };
    }
  },
  
  getThemes: async () => {
    try {
      const response = await api.get('/api/themes');
      return response.data.themes || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des thèmes:', error);
      return [];
    }
  }
};

export const taskService = {
  getTasks: async (theme) => {
    try {
      const response = await api.get(`/api/tasks/${theme}`);
      return response.data.tasks;
    } catch (error) {
      console.error(`Erreur lors de la récupération des tâches pour "${theme}":`, error);
      return [];
    }
  },
  
  updateTask: async (theme, taskId, updates) => {
    try {
      const response = await api.put(`/api/tasks/${theme}/${taskId}`, updates);
      return response.data.task;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de la tâche ${taskId}:`, error);
      throw error;
    }
  },
  
  deleteTask: async (theme, taskId) => {
    try {
      await api.delete(`/api/tasks/${theme}/${taskId}`);
      return true;
    } catch (error) {
      console.error(`Erreur lors de la suppression de la tâche ${taskId}:`, error);
      throw error;
    }
  },
  
  getRecommendations: async (availableTime = '30min', energyLevel = 'medium') => {
    try {
      const response = await api.get(`/api/recommendations?available_time=${availableTime}&energy_level=${energyLevel}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des recommandations:', error);
      return { message: "Impossible d'obtenir des recommandations", recommendations: [] };
    }
  },
  
  getWeeklyReview: async () => {
    try {
      const response = await api.get('/api/weekly-review');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération de la revue hebdomadaire:', error);
      return { message: "Impossible d'obtenir la revue hebdomadaire", statistics: {} };
    }
  }
};

// Service pour les recommandations et analyses
export const recommendationService = {
  getRecommendations: async (availableTime, energyLevel) => {
    try {
      const response = await api.get(`/api/recommendations?time=${availableTime}&energy=${energyLevel}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des recommandations:', error);
      throw error;
    }
  },
  
  getWeeklyReview: async () => {
    try {
      const response = await api.get('/api/weekly-review');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération du rapport hebdomadaire:', error);
      throw error;
    }
  }
};

export const categoryService = {
  getCategories: async () => {
    try {
      const response = await api.get('/api/categories');
      return response.data.categories;
    } catch (error) {
      console.error('Erreur lors de la récupération des catégories:', error);
      return [];
    }
  }
};

// Test de connexion au backend
export const testBackendConnection = async () => {
  try {
    const response = await api.get('/api/health');
    return { success: true, message: 'Connexion au backend réussie', data: response.data };
  } catch (error) {
    console.error('Erreur de connexion au backend', error);
    return { 
      success: false, 
      message: 'Échec de connexion au backend', 
      error: error.toString(),
      status: error.response?.status 
    };
  }
};

export const habitService = {
  getUserHabits: async (userId) => {
    try {
      const response = await api.get(`/api/habits?user_id=${userId}`);
      return response.data.habits || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des habitudes:', error);
      throw error;
    }
  },
  
  addHabit: async (habitData) => {
    try {
      const response = await api.post('/api/habits', habitData);
      return response.data.habit;
    } catch (error) {
      console.error('Erreur lors de l\'ajout d\'une habitude:', error);
      throw error;
    }
  },
  
  updateHabit: async (habitId, habitData) => {
    try {
      const response = await api.put(`/api/habits/${habitId}`, habitData);
      return response.data.habit;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de l'habitude ${habitId}:`, error);
      throw error;
    }
  },
  
  deleteHabit: async (habitId) => {
    try {
      const response = await api.delete(`/api/habits/${habitId}`);
      return response.data.success;
    } catch (error) {
      console.error(`Erreur lors de la suppression de l'habitude ${habitId}:`, error);
      throw error;
    }
  },
  
  getHabitEntries: async (habitId, startDate = null, endDate = null) => {
    try {
      let url = `/api/habits/${habitId}/entries`;
      if (startDate || endDate) {
        const params = new URLSearchParams();
        if (startDate) params.append('start_date', startDate);
        if (endDate) params.append('end_date', endDate);
        url += `?${params.toString()}`;
      }
      const response = await api.get(url);
      return response.data.entries;
    } catch (error) {
      console.error(`Erreur lors de la récupération des entrées pour l'habitude ${habitId}:`, error);
      throw error;
    }
  },
  
  addHabitEntry: async (entryData) => {
    try {
      const response = await api.post('/api/habits/entries', entryData);
      return response.data.entry;
    } catch (error) {
      console.error('Erreur lors de l\'ajout d\'une entrée:', error);
      throw error;
    }
  },
  
  deleteHabitEntry: async (entryId) => {
    try {
      const response = await api.delete(`/api/habits/entries/${entryId}`);
      return response.data.success;
    } catch (error) {
      console.error(`Erreur lors de la suppression de l'entrée ${entryId}:`, error);
      throw error;
    }
  },
  
  getHabitStats: async (userId, habitId = null, period = 'month') => {
    try {
      let url = `/api/habits/stats?user_id=${userId}&period=${period}`;
      if (habitId) url += `&habit_id=${habitId}`;
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      throw error;
    }
  }
};

export default {
  themeService,
  taskService,
  recommendationService,
  categoryService,
  testBackendConnection,
  habitService
}; 