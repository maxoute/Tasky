import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

// Components
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Tasks from './pages/Tasks';
import AIAgents from './pages/AIAgents';
import SmartObjectives from './pages/SmartObjectives';
import Habits from './pages/Habits';
import WeeklyReport from './pages/WeeklyReport';

// Styles
import './App.css';

function App() {
  const [selectedTheme, setSelectedTheme] = useState('');
  const [tasks, setTasks] = useState([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false); // Pour mobile
  const [loading, setLoading] = useState(true);
  
  // Fonction pour charger les tâches depuis l'API
  const loadTasks = async () => {
    console.log('🔄 [Frontend] Chargement des tâches depuis /api/tasks...');
    try {
      const response = await fetch('/api/tasks');
      console.log('📡 [Frontend] Réponse reçue:', response.status, response.statusText);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ [Frontend] Données reçues:', data);
        console.log(`✅ [Frontend] ${data.tasks?.length || 0} tâches chargées`);
        
        if (data.tasks && Array.isArray(data.tasks)) {
          setTasks(data.tasks);
          console.log('✅ [Frontend] Tâches mises à jour dans le state');
        } else {
          console.warn('⚠️ [Frontend] Format de données inattendu:', data);
        }
      } else {
        console.error('❌ [Frontend] Erreur HTTP:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('❌ [Frontend] Erreur lors du chargement des tâches:', error);
    } finally {
      setLoading(false);
    }
  };

  // Charger les tâches au démarrage
  useEffect(() => {
    console.log('🚀 [Frontend] App démarrée - chargement initial des tâches');
    loadTasks();
  }, []);
  
  // Exemple de thèmes populaires et récents (à connecter avec le backend plus tard)
  const popularThemes = ['Productivité', 'Santé', 'Finance', 'Apprentissage'];
  const recentThemes = ['Marketing', 'Projet IA', 'Sport'];
  
  const handleThemeSelect = (theme) => {
    setSelectedTheme(theme);
    // TODO: Implémenter la génération de tâches basée sur le thème
    console.log('Thème sélectionné:', theme);
  };

  const handleGenerateTasks = (theme, newTasks) => {
    console.log('🔥 [Frontend] Nouvelles tâches générées:', newTasks);
    console.log('🔥 [Frontend] Ajout aux tâches existantes...');
    setTasks(prevTasks => {
      const updatedTasks = [...prevTasks, ...newTasks];
      console.log(`🔥 [Frontend] Total tâches après ajout: ${updatedTasks.length}`);
      return updatedTasks;
    });
  };

  // Fonction pour mettre à jour une tâche (state + API)
  const handleTaskUpdate = async (taskId, updates) => {
    console.log(`🔄 [Frontend] Mise à jour tâche ${taskId}:`, updates);
    
    try {
      // Solution temporaire : mettre à jour le state immédiatement pour l'UX
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId ? { ...task, ...updates } : task
        )
      );
      console.log('✅ [Frontend] State local mis à jour (optimistic)');
      
      // Appel à la nouvelle API PATCH qui fonctionne
      if (updates.completed !== undefined) {
        console.log('🔄 [Frontend] Appel API PATCH /tasks/{id}/complete...');
        const response = await fetch(`/api/tasks/${taskId}/complete`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ completed: updates.completed }),
        });

        if (response.ok) {
          const data = await response.json();
          console.log('✅ [Frontend] Tâche mise à jour en base via PATCH:', data);
        } else {
          console.error('❌ [Frontend] Erreur API PATCH:', response.status);
          // En cas d'erreur, recharger pour synchroniser
          setTimeout(() => loadTasks(), 1000);
        }
      } else {
        console.log('🔄 [Frontend] Mise à jour non-completed, simulation...');
        setTimeout(() => {
          console.log('✅ [Frontend] Simulation réussie');
        }, 500);
      }
      
    } catch (error) {
      console.error('❌ [Frontend] Erreur lors de la mise à jour de la tâche:', error);
      // En cas d'erreur, recharger les tâches depuis l'API pour annuler les changements optimistes
      loadTasks();
    }
  };

  // Fonction pour supprimer une tâche (state + API) 
  const handleTaskDelete = async (taskId) => {
    console.log(`🗑️ [Frontend] Suppression tâche ${taskId}`);
    
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        console.log('✅ [Frontend] Tâche supprimée de la base');
        
        // Supprimer du state local seulement si l'API a réussi
        setTasks(prevTasks => 
          prevTasks.filter(task => task.id !== taskId)
        );
        console.log('✅ [Frontend] Tâche supprimée du state local');
      } else {
        console.error('❌ [Frontend] Erreur API lors de la suppression:', response.status);
      }
    } catch (error) {
      console.error('❌ [Frontend] Erreur lors de la suppression de la tâche:', error);
    }
  };
  
  return (
    <Router>
      <div className={`app-container bg-gray-50 ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        {/* Bouton hamburger mobile */}
        <button
          className="fixed top-4 left-4 z-40 lg:hidden bg-white border border-gray-200 rounded-full p-2 shadow-md"
          onClick={() => setSidebarOpen(true)}
          aria-label="Ouvrir le menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
        <Sidebar 
          onThemeSelect={handleThemeSelect} 
          popularThemes={popularThemes}
          recentThemes={recentThemes}
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
        <main className={`main-content transition-all duration-300 ${sidebarCollapsed ? 'ml-0 md:ml-16 lg:ml-16' : 'ml-0 md:ml-16 lg:ml-64'}`}>
          <Routes>
            <Route path="/" element={
              <Dashboard 
                selectedTheme={selectedTheme}
                onGenerateTasks={handleGenerateTasks}
                tasks={tasks}
                onTaskUpdate={handleTaskUpdate}
                onTaskDelete={handleTaskDelete}
              />
            } />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/smart-objectives" element={<SmartObjectives />} />
            <Route path="/ai-agents" element={<AIAgents />} />
            <Route path="/habits" element={<Habits />} />
            <Route path="/weekly-report" element={<WeeklyReport />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App; 