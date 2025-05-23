import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { API_CONFIG } from '../config/api.js';

// Client API avec configuration de base
const apiClient = axios.create(API_CONFIG);

// Ajouter des intercepteurs pour debug
apiClient.interceptors.request.use(
  (config) => {
    console.log(`🔄 Requête API: ${config.method.toUpperCase()} ${config.url}`, config.data);
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

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'active', 'completed'
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('list'); // 'list' ou 'generator'
  const [theme, setTheme] = useState('');
  const [generatedTasks, setGeneratedTasks] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    deadline: '',
    category: '',
    priority: 'medium'
  });

  // Liste des catégories disponibles
  const categories = [
    'Vidéo', 'Organisation', 'Productivité', 'Travailler',
    'Suivi personnel', 'Automatisation', 'Marketing', 'Technique'
  ];

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Essayer de récupérer les tâches depuis le backend
      const response = await apiClient.get('/tasks');
      setTasks(response.data.tasks || []);
    } catch (err) {
      console.error('Erreur lors de la récupération des tâches:', err);
      setError('Erreur lors du chargement des tâches. Utilisation de données locales.');
      
      // Fallback sur les données mockées en cas d'erreur
      const mockTasks = [
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
        },
        { 
          id: 6, 
          title: 'Planifier la rétro de la semaine', 
          completed: false, 
          category: 'Productivité', 
          deadline: '27 avril 2025',
          priority: 'medium'
        },
        { 
          id: 7, 
          title: 'Préparer les slides pour le live Discord', 
          completed: false, 
          category: 'Travailler', 
          deadline: '28 avril 2025',
          priority: 'medium'
        },
        { 
          id: 8, 
          title: 'Faire le point sur les habitudes de sommeil', 
          completed: false, 
          category: 'Suivi personnel', 
          deadline: '29 avril 2025',
          priority: 'low'
        },
        { 
          id: 9, 
          title: 'Ajouter une fonctionnalité "objectifs IA" à l\'app', 
          completed: false, 
          category: 'Productivité', 
          deadline: '30 avril 2025',
          priority: 'high'
        },
        { 
          id: 10, 
          title: 'Relancer les utilisateurs inactifs avec un e-mail IA', 
          completed: false, 
          category: 'Automatisation', 
          deadline: '01 mai 2025',
          priority: 'medium'
        }
      ];
      
      setTasks(mockTasks);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTaskCompletion = async (taskId) => {
    try {
      // Mettre à jour localement d'abord pour une UX réactive
      const taskToUpdate = tasks.find(t => t.id === taskId);
      if (!taskToUpdate) return;
      
      const updatedTasks = tasks.map(task => 
        task.id === taskId ? { ...task, completed: !task.completed } : task
      );
      setTasks(updatedTasks);
      
      // Puis mettre à jour dans le backend
      await apiClient.put(`/tasks/${taskId}`, { 
        completed: !taskToUpdate.completed 
      });
    } catch (err) {
      console.error('Erreur lors de la mise à jour de la tâche:', err);
      // En cas d'erreur, on revient à l'état précédent
      fetchTasks();
    }
  };

  const deleteTask = async (taskId) => {
    try {
      // Supprimer localement d'abord
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
      
      // Puis supprimer du backend
      await apiClient.delete(`/tasks/${taskId}`);
    } catch (err) {
      console.error('Erreur lors de la suppression de la tâche:', err);
      // En cas d'erreur, on récupère toutes les tâches à nouveau
      fetchTasks();
    }
  };

  const moveTaskToBottom = (taskId) => {
    const taskToMove = tasks.find(task => task.id === taskId);
    if (!taskToMove) return;
    
    setTasks(prevTasks => [
      ...prevTasks.filter(task => task.id !== taskId),
      taskToMove
    ]);
  };

  // Fonction pour soumettre le formulaire d'ajout de tâche
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation simple
    if (!newTask.title.trim()) {
      alert('Veuillez saisir un titre pour la tâche');
      return;
    }
    
    // Préparer les données de la tâche
    const taskData = {
      title: newTask.title,
      deadline: newTask.deadline || 'Non définie',
      category: newTask.category || 'Autre',
      priority: newTask.priority,
      completed: false
    };
    
    try {
      setIsLoading(true);
      
      // Envoyer la nouvelle tâche au backend
      const response = await apiClient.post('/tasks', taskData);
      
      // Ajouter la tâche retournée par le backend à notre liste locale
      if (response.data && response.data.task) {
        setTasks(prevTasks => [...prevTasks, response.data.task]);
      } else {
        // Fallback si le backend ne retourne pas la tâche créée
        const newTaskWithId = {
          ...taskData,
          id: Date.now() // Générer un ID temporaire
        };
        setTasks(prevTasks => [...prevTasks, newTaskWithId]);
      }
      
      // Réinitialiser le formulaire et fermer le modal
      setNewTask({
        title: '',
        deadline: '',
        category: '',
        priority: 'medium'
      });
      setShowModal(false);
    } catch (err) {
      console.error('Erreur lors de la création de la tâche:', err);
      alert('Erreur lors de la création de la tâche. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  // Gérer les changements dans le formulaire
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewTask(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Générer des tâches avec l'IA
  const generateTasks = async () => {
    if (!theme.trim()) {
      alert('Veuillez saisir un thème ou une description pour générer des tâches');
      return;
    }

    setIsGenerating(true);
    setError(null);
    
    try {
      const response = await apiClient.post('/generate', { 
        theme,
        is_smart_objective: true // Générer des tâches structurées
      });
      
      if (response.data && response.data.tasks) {
        setGeneratedTasks(response.data.tasks);
      } else {
        throw new Error('Aucune tâche n\'a été générée');
      }
    } catch (err) {
      console.error('Erreur lors de la génération des tâches:', err);
      setError('Erreur lors de la génération des tâches. Veuillez réessayer.');
      
      // Fallback avec des tâches d'exemple
      setGeneratedTasks([
        {
          id: 'gen_' + Date.now(),
          text: 'Exemple de tâche générée pour: ' + theme,
          deadline: new Date(Date.now() + 7*24*60*60*1000).toISOString().split('T')[0],
          priority: 'medium',
          category: 'Autre'
        }
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  // Ajouter une tâche générée à la liste principale
  const addGeneratedTask = async (task) => {
    const taskData = {
      title: task.text || task.title,
      deadline: task.deadline || 'Non définie',
      category: task.hashtags ? task.hashtags[0] : (task.category || 'Autre'),
      priority: task.eisenhower === 'important_urgent' ? 'high' : 
               task.eisenhower === 'important_not_urgent' ? 'medium' : 'low',
      completed: false
    };
    
    try {
      setIsLoading(true);
      
      // Envoyer la tâche au backend
      const response = await apiClient.post('/tasks', taskData);
      
      if (response.data && response.data.task) {
        setTasks(prevTasks => [...prevTasks, response.data.task]);
        
        // Retirer la tâche de la liste des tâches générées
        setGeneratedTasks(prev => prev.filter(t => t.id !== task.id));
        
        alert('Tâche ajoutée avec succès !');
      } else {
        throw new Error('Erreur lors de l\'ajout de la tâche');
      }
    } catch (err) {
      console.error('Erreur lors de l\'ajout de la tâche générée:', err);
      alert('Erreur lors de l\'ajout de la tâche. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true; // 'all'
  });

  // Fonction pour déterminer la couleur de priorité
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Fonction pour obtenir la couleur de catégorie
  const getCategoryColor = (category) => {
    switch (category.toLowerCase()) {
      case 'vidéo': return 'bg-blue-500 text-white';
      case 'organisation': return 'bg-purple-500 text-white';
      case 'productivité': return 'bg-green-500 text-white';
      case 'travailler': return 'bg-indigo-500 text-white';
      case 'suivi personnel': return 'bg-pink-500 text-white';
      case 'automatisation': return 'bg-orange-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className="py-8 px-4 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 font-futuristic">Mes Tâches</h1>
      
      {/* Tabs */}
      <div className="mb-6 flex space-x-4 border-b border-gray-200">
        <button 
          onClick={() => setActiveTab('list')}
          className={`px-4 py-2 ${activeTab === 'list' ? 'border-b-2 border-black font-semibold' : 'text-gray-500'}`}
        >
          Liste de tâches
        </button>
        <button 
          onClick={() => setActiveTab('generator')}
          className={`px-4 py-2 ${activeTab === 'generator' ? 'border-b-2 border-black font-semibold' : 'text-gray-500'}`}
        >
          Générateur de tâches IA
        </button>
      </div>
      
      {activeTab === 'list' ? (
        <>
          {/* Filtres */}
          <div className="mb-6 flex space-x-2">
            <button 
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-md ${filter === 'all' ? 'bg-black text-white' : 'bg-gray-100'}`}
            >
              Toutes
            </button>
            <button 
              onClick={() => setFilter('active')}
              className={`px-4 py-2 rounded-md ${filter === 'active' ? 'bg-black text-white' : 'bg-gray-100'}`}
            >
              À faire
            </button>
            <button 
              onClick={() => setFilter('completed')}
              className={`px-4 py-2 rounded-md ${filter === 'completed' ? 'bg-black text-white' : 'bg-gray-100'}`}
            >
              Terminées
            </button>
          </div>
          
          {/* Liste des tâches format tableau */}
          {isLoading && tasks.length === 0 ? (
            <div className="flex justify-center py-12">
              <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">{error}</div>
          ) : (
            <div className="overflow-hidden shadow-sm rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tâche
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Deadline
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Catégorie
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTasks.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-4 whitespace-nowrap text-center text-gray-500">
                        Aucune tâche {filter === 'active' ? 'à faire' : filter === 'completed' ? 'terminée' : ''} trouvée
                      </td>
                    </tr>
                  ) : (
                    filteredTasks.map(task => (
                      <motion.tr 
                        key={task.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={task.completed ? 'bg-gray-50' : ''}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <input 
                              type="checkbox" 
                              checked={task.completed} 
                              onChange={() => toggleTaskCompletion(task.id)}
                              className="h-5 w-5 mr-3 rounded border-gray-300"
                            />
                            <span className={`font-medium ${task.completed ? 'line-through text-gray-400' : ''}`}>
                              {task.title}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {task.deadline}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getCategoryColor(task.category)}`}>
                            {task.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button 
                              onClick={() => moveTaskToBottom(task.id)}
                              className="text-gray-400 hover:text-gray-600"
                              title="Déplacer en bas"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
                              </svg>
                            </button>
                            <button 
                              onClick={() => deleteTask(task.id)}
                              className="text-red-400 hover:text-red-600"
                              title="Supprimer"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Bouton d'ajout */}
          <div className="mt-8 flex justify-center">
            <button 
              className="px-6 py-3 bg-black text-white rounded-full flex items-center shadow-lg hover:bg-gray-800 transition-colors"
              onClick={() => setShowModal(true)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Ajouter une tâche
            </button>
          </div>
        </>
      ) : (
        <>
          {/* Générateur de tâches IA */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Générateur de tâches IA</h2>
            <p className="text-gray-600 mb-4">
              Décrivez un projet ou un objectif, et l'IA générera des tâches pertinentes pour vous aider à l'accomplir.
            </p>
            
            <div className="mb-6">
              <label htmlFor="theme" className="block text-sm font-medium text-gray-700 mb-1">Thème ou description</label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <input
                  type="text"
                  name="theme"
                  id="theme"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  className="flex-1 min-w-0 block w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-black focus:border-black sm:text-sm"
                  placeholder="Ex: Préparer un webinaire sur l'IA, Organiser mon déménagement..."
                />
                <button
                  type="button"
                  onClick={generateTasks}
                  disabled={isGenerating}
                  className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-black hover:bg-gray-800 focus:outline-none disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Génération...
                    </>
                  ) : 'Générer des tâches'}
                </button>
              </div>
            </div>
            
            {error && (
              <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-md">
                {error}
              </div>
            )}
            
            {generatedTasks.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-3">Tâches générées</h3>
                <div className="space-y-4">
                  {generatedTasks.map(task => (
                    <div key={task.id} className="border border-gray-200 rounded-md p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{task.text || task.title}</h4>
                          <div className="mt-2 text-sm text-gray-600">
                            <p>
                              <span className="font-semibold">Deadline:</span> {task.deadline || 'Non définie'}
                            </p>
                            {task.estimated_time && (
                              <p>
                                <span className="font-semibold">Temps estimé:</span> {task.estimated_time}
                              </p>
                            )}
                            {task.eisenhower && (
                              <p>
                                <span className="font-semibold">Priorité:</span> {
                                  task.eisenhower === 'important_urgent' ? 'Haute' :
                                  task.eisenhower === 'important_not_urgent' ? 'Moyenne' : 'Basse'
                                }
                              </p>
                            )}
                            {task.hashtags && task.hashtags.length > 0 && (
                              <p className="mt-1">
                                {task.hashtags.map(tag => (
                                  <span key={tag} className="inline-block bg-gray-200 px-2 py-1 rounded-full text-xs mr-1">
                                    #{tag}
                                  </span>
                                ))}
                              </p>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => addGeneratedTask(task)}
                          className="flex-shrink-0 ml-3 px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none"
                        >
                          Ajouter
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
      
      {/* Indicateur de chargement lors d'une opération */}
      {isLoading && tasks.length > 0 && (
        <div className="fixed bottom-4 right-4 bg-black text-white py-2 px-4 rounded-md shadow-lg">
          <div className="flex items-center">
            <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Chargement...
          </div>
        </div>
      )}
      
      {/* Modal d'ajout de tâche */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Fond semi-transparent */}
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setShowModal(false)}></div>

            {/* Centrage modal */}
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            {/* Contenu modal */}
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div className="absolute top-0 right-0 pt-4 pr-4">
                <button
                  type="button"
                  className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                  onClick={() => setShowModal(false)}
                >
                  <span className="sr-only">Fermer</span>
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                  <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">Ajouter une nouvelle tâche</h3>
                  
                  <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    {/* Titre */}
                    <div>
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700">Titre</label>
                      <input
                        type="text"
                        name="title"
                        id="title"
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                        placeholder="Entrez le titre de la tâche"
                        value={newTask.title}
                        onChange={handleChange}
                      />
                    </div>
                    
                    {/* Deadline */}
                    <div>
                      <label htmlFor="deadline" className="block text-sm font-medium text-gray-700">Deadline</label>
                      <input
                        type="text"
                        name="deadline"
                        id="deadline"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                        placeholder="Ex: 25 avril 2025"
                        value={newTask.deadline}
                        onChange={handleChange}
                      />
                    </div>
                    
                    {/* Catégorie */}
                    <div>
                      <label htmlFor="category" className="block text-sm font-medium text-gray-700">Catégorie</label>
                      <select
                        name="category"
                        id="category"
                        className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                        value={newTask.category}
                        onChange={handleChange}
                      >
                        <option value="">Sélectionner une catégorie</option>
                        {categories.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>
                    
                    {/* Priorité */}
                    <div>
                      <label htmlFor="priority" className="block text-sm font-medium text-gray-700">Priorité</label>
                      <select
                        name="priority"
                        id="priority"
                        className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                        value={newTask.priority}
                        onChange={handleChange}
                      >
                        <option value="low">Basse</option>
                        <option value="medium">Moyenne</option>
                        <option value="high">Haute</option>
                      </select>
                    </div>
                    
                    {/* Boutons */}
                    <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3">
                      <button
                        type="button"
                        className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:text-sm"
                        onClick={() => setShowModal(false)}
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-black text-base font-medium text-white hover:bg-gray-800 focus:outline-none sm:text-sm"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Chargement...
                          </>
                        ) : 'Ajouter'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks; 