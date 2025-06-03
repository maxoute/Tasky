import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import TodoList from '../components/TodoList';
import TodoForm from '../components/TodoForm';
import TodayTasks from '../components/TodayTasks';
import TaskService, { Task } from '../services/task-service';

const TasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('list'); // 'list' ou 'generator'
  const [theme, setTheme] = useState<string>('');
  const [generatedTasks, setGeneratedTasks] = useState<Task[]>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Récupérer les tâches au chargement de la page
  useEffect(() => {
    fetchTasks();
  }, []);

  // Récupérer toutes les tâches
  const fetchTasks = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedTasks = await TaskService.getAllTasks();
      setTasks(fetchedTasks);
    } catch (err) {
      console.error('Erreur lors de la récupération des tâches:', err);
      setError('Erreur lors du chargement des tâches. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  // Changer l'état d'une tâche (complétée/non complétée)
  const handleTaskToggle = async (taskId: number | string) => {
    const taskToUpdate = tasks.find(t => t.id === taskId);
    if (!taskToUpdate) return;
    
    // Mise à jour optimiste UI
    const updatedTasks = tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    setTasks(updatedTasks);
    
    try {
      // Mise à jour dans la base de données
      await TaskService.updateTask(taskId, { completed: !taskToUpdate.completed });
    } catch (err) {
      console.error('Erreur lors de la mise à jour de la tâche:', err);
      // En cas d'erreur, revenir à l'état précédent
      setTasks(tasks);
      setError('Erreur lors de la mise à jour de la tâche. Veuillez réessayer.');
    }
  };

  // Supprimer une tâche
  const handleTaskDelete = async (taskId: number | string) => {
    // Mise à jour optimiste UI
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
    
    try {
      // Suppression dans la base de données
      await TaskService.deleteTask(taskId);
    } catch (err) {
      console.error('Erreur lors de la suppression de la tâche:', err);
      // En cas d'erreur, recharger toutes les tâches
      fetchTasks();
      setError('Erreur lors de la suppression de la tâche. Veuillez réessayer.');
    }
  };

  // Ajouter une nouvelle tâche
  const handleAddTask = async (taskData: Omit<Task, 'id'>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const newTask = await TaskService.createTask(taskData);
      if (newTask) {
        setTasks(prevTasks => [...prevTasks, newTask]);
        setShowForm(false);
      } else {
        throw new Error('Erreur lors de la création de la tâche');
      }
    } catch (err) {
      console.error('Erreur lors de la création de la tâche:', err);
      setError('Erreur lors de la création de la tâche. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  // Générer des tâches avec l'IA
  const handleGenerateTasks = async () => {
    if (!theme.trim()) {
      setError('Veuillez saisir un thème ou une description pour générer des tâches');
      return;
    }

    setIsGenerating(true);
    setError(null);
    
    try {
      const tasks = await TaskService.generateTasks(theme);
      if (tasks.length > 0) {
        setGeneratedTasks(tasks);
      } else {
        throw new Error('Aucune tâche n\'a été générée');
      }
    } catch (err) {
      console.error('Erreur lors de la génération des tâches:', err);
      setError('Erreur lors de la génération des tâches. Veuillez réessayer.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Ajouter une tâche générée à la liste principale
  const handleAddGeneratedTask = async (task: Task) => {
    setIsLoading(true);
    
    const taskData = {
      title: task.title,
      completed: false,
      deadline: task.deadline,
      category: task.category,
      priority: task.priority
    };
    
    try {
      const newTask = await TaskService.createTask(taskData);
      if (newTask) {
        // Ajouter la tâche à la liste
        setTasks(prevTasks => [...prevTasks, newTask]);
        
        // Retirer la tâche de la liste des tâches générées
        setGeneratedTasks(prev => prev.filter(t => t.id !== task.id));
      } else {
        throw new Error('Erreur lors de l\'ajout de la tâche');
      }
    } catch (err) {
      console.error('Erreur lors de l\'ajout de la tâche générée:', err);
      setError('Erreur lors de l\'ajout de la tâche. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="py-8 px-4 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Mes Tâches</h1>
      
      {/* Notification d'erreur */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
          <button 
            className="ml-2 font-bold"
            onClick={() => setError(null)}
          >
            ×
          </button>
        </div>
      )}
      
      {/* Tâches du jour */}
      <div className="mb-8">
        <TodayTasks
          tasks={tasks}
          onTaskUpdate={handleTaskToggle}
          onTaskDelete={handleTaskDelete}
          isLoading={isLoading}
        />
      </div>
      
      {/* Tabs */}
      <div className="mb-6 flex space-x-4 border-b border-gray-200">
        <button 
          onClick={() => setActiveTab('list')}
          className={`px-4 py-2 ${activeTab === 'list' ? 'border-b-2 border-black font-semibold' : 'text-gray-500'}`}
        >
          Liste des tâches
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
          {/* Liste des tâches */}
          <div className="mb-8">
            <TodoList
              tasks={tasks}
              onTaskUpdate={handleTaskToggle}
              onTaskDelete={handleTaskDelete}
              isLoading={isLoading}
            />
          </div>
          
          {/* Bouton d'ajout et formulaire */}
          {!showForm ? (
            <div className="flex justify-center">
              <button 
                className="px-6 py-3 bg-black text-white rounded-full flex items-center shadow-lg hover:bg-gray-800 transition-colors"
                onClick={() => setShowForm(true)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Ajouter une tâche
              </button>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <TodoForm
                onSubmit={handleAddTask}
                isLoading={isLoading}
              />
              
              <div className="mt-4 flex justify-center">
                <button 
                  className="text-gray-600 hover:text-gray-900"
                  onClick={() => setShowForm(false)}
                >
                  Annuler
                </button>
              </div>
            </motion.div>
          )}
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
                  onClick={handleGenerateTasks}
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
            
            {/* Tâches générées */}
            {generatedTasks.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-3">Tâches générées</h3>
                <div className="space-y-4">
                  {generatedTasks.map(task => (
                    <div key={task.id} className="border border-gray-200 rounded-md p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{task.title}</h4>
                          <div className="mt-2 text-sm text-gray-600">
                            {task.deadline && (
                              <p>
                                <span className="font-semibold">Deadline:</span> {task.deadline}
                              </p>
                            )}
                            {task.priority && (
                              <p>
                                <span className="font-semibold">Priorité:</span> {
                                  task.priority === 'high' ? 'Haute' :
                                  task.priority === 'medium' ? 'Moyenne' : 'Basse'
                                }
                              </p>
                            )}
                            {task.category && (
                              <p>
                                <span className="font-semibold">Catégorie:</span> {task.category}
                              </p>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleAddGeneratedTask(task)}
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
      
      {/* Indicateur de chargement */}
      {isLoading && (
        <div className="fixed bottom-4 right-4 bg-black text-white py-2 px-4 rounded-md shadow-lg">
          <div className="flex items-center">
            <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Chargement...
          </div>
        </div>
      )}
    </div>
  );
};

export default TasksPage; 