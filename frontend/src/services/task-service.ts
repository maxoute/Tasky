import axios from 'axios';

export interface Task {
  id: number | string;
  title: string;
  completed: boolean;
  deadline?: string;
  category?: string;
  priority?: 'low' | 'medium' | 'high';
}

// Création de l'instance axios avec configuration
const apiClient = axios.create({
  baseURL: 'http://localhost:8001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Ajout d'intercepteurs pour le debug
apiClient.interceptors.request.use(
  (config) => {
    console.log(`🔄 Requête API: ${config.method?.toUpperCase()} ${config.url}`, config.data);
    return config;
  },
  (error) => {
    console.error('❌ Erreur lors de la préparation de la requête:', error);
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ Réponse API reçue: ${response.status}`, response.data);
    return response;
  },
  (error) => {
    console.error('❌ Erreur de réponse API:', error.response || error.message || error);
    return Promise.reject(error);
  }
);

// Mock data en cas d'erreur avec l'API
const mockTasks: Task[] = [
  { 
    id: 1, 
    title: 'Écrire le script de la vidéo "Comment fonctionne ChatGPT"', 
    completed: false, 
    category: 'Vidéo', 
    deadline: '21 avril 2025',
    priority: 'high'
  },
  { 
    id: 2, 
    title: 'Trier les papiers administratifs avant le déménagement', 
    completed: false, 
    category: 'Organisation', 
    deadline: '22 avril 2025',
    priority: 'medium'
  },
  { 
    id: 3, 
    title: 'Publier une newsletter sur les actualités IA', 
    completed: false, 
    category: 'Productivité', 
    deadline: '23 avril 2025',
    priority: 'medium'
  },
  { 
    id: 4, 
    title: 'Mettre à jour la fiche Notion du module N8N', 
    completed: false, 
    category: 'Travailler', 
    deadline: '24 avril 2025',
    priority: 'low'
  },
  { 
    id: 5, 
    title: 'Tourner la vidéo "Créer un agent IA sans coder"', 
    completed: false, 
    category: 'Vidéo', 
    deadline: '25 avril 2025',
    priority: 'high'
  }
];

// Service pour les opérations sur les tâches
const TaskService = {
  // Récupérer toutes les tâches
  getAllTasks: async (): Promise<Task[]> => {
    try {
      const response = await apiClient.get('/tasks');
      return response.data.tasks || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des tâches:', error);
      // Retourner les données mockées en cas d'erreur
      return mockTasks;
    }
  },

  // Récupérer une tâche par son ID
  getTaskById: async (taskId: number | string): Promise<Task | null> => {
    try {
      const response = await apiClient.get(`/tasks/${taskId}`);
      return response.data.task || null;
    } catch (error) {
      console.error(`Erreur lors de la récupération de la tâche ${taskId}:`, error);
      // Retourner null en cas d'erreur
      return null;
    }
  },

  // Créer une nouvelle tâche
  createTask: async (taskData: Omit<Task, 'id'>): Promise<Task | null> => {
    try {
      const response = await apiClient.post('/tasks', taskData);
      return response.data.task || null;
    } catch (error) {
      console.error('Erreur lors de la création de la tâche:', error);
      // Retourner null en cas d'erreur
      return null;
    }
  },

  // Mettre à jour une tâche existante
  updateTask: async (taskId: number | string, updates: Partial<Task>): Promise<Task | null> => {
    try {
      const response = await apiClient.put(`/tasks/${taskId}`, updates);
      return response.data.task || null;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de la tâche ${taskId}:`, error);
      // Retourner null en cas d'erreur
      return null;
    }
  },

  // Supprimer une tâche
  deleteTask: async (taskId: number | string): Promise<boolean> => {
    try {
      await apiClient.delete(`/tasks/${taskId}`);
      return true;
    } catch (error) {
      console.error(`Erreur lors de la suppression de la tâche ${taskId}:`, error);
      // Retourner false en cas d'erreur
      return false;
    }
  },

  // Générer des tâches avec l'IA
  generateTasks: async (theme: string): Promise<Task[]> => {
    try {
      const response = await apiClient.post('/generate', { 
        theme,
        is_smart_objective: true // Générer des tâches structurées
      });
      
      if (response.data && response.data.tasks) {
        return response.data.tasks.map((task: any) => ({
          id: `gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          title: task.text || task.title,
          completed: false,
          deadline: task.deadline || undefined,
          category: task.hashtags ? task.hashtags[0] : (task.category || undefined),
          priority: task.eisenhower === 'important_urgent' ? 'high' : 
                   task.eisenhower === 'important_not_urgent' ? 'medium' : 'low'
        }));
      }
      
      throw new Error('Aucune tâche n\'a été générée');
    } catch (error) {
      console.error('Erreur lors de la génération des tâches:', error);
      // Retourner un tableau vide en cas d'erreur
      return [];
    }
  }
};

export default TaskService; 