import React, { useState, useEffect } from 'react';
import ThemeGenerator from './ThemeGenerator';
import TaskList from './TaskList';
import RecommendationWidget from './RecommendationWidget';
import TodayTodoWidget from './TodayTodoWidget';
import CalendarWidget from './CalendarWidget';
import ProductivityWidget from './ProductivityWidget';
import GoogleCalendarConnect from './GoogleCalendarConnect';
import { getGoogleEventsToday } from '../services/api';

const Dashboard = ({
  username = 'Maxens',
  onGenerateTasks,
  isLoading,
  tasks = [],
  onTaskUpdate,
  onTaskDelete,
  activeTheme,
  stats = {}
}) => {
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [googleEvents, setGoogleEvents] = useState([]);
  const [showCalendarModal, setShowCalendarModal] = useState(false);

  // S'assurer que tasks est toujours un tableau
  const safeTasks = Array.isArray(tasks) ? tasks : [];
  
  // Calculer les vraies statistiques depuis les tâches
  const completedTasks = safeTasks.filter(task => task.completed).length;
  const totalTasks = safeTasks.length;
  const pendingTasks = totalTasks - completedTasks;
  const progressPercentage = totalTasks > 0 
    ? Math.round((completedTasks / totalTasks) * 100) 
    : 0;
  
  // Statistiques pour les composants
  const calculatedStats = {
    total: totalTasks,
    completed: completedTasks,
    pending: pendingTasks,
    completionRate: progressPercentage,
    totalTasks,
    completedTasks
  };
  
  console.log(`📊 [Dashboard] Stats calculées:`, calculatedStats);
  
  useEffect(() => {
    getGoogleEventsToday().then(res => setGoogleEvents(res.events || [])).catch(() => {});
  }, []);

  return (
    <div className="pt-4 pb-8 px-2 sm:px-4 md:px-6 min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
          {/* Colonne 1: Générateur et Productivité (occupe 2/3 de l'espace) */}
          <div className="md:col-span-1 xl:col-span-2 space-y-4 md:space-y-6">
            {/* Générateur de tâches */}
            <div className="animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
            <ThemeGenerator 
              onTasksGenerated={onGenerateTasks} 
            />
            </div>
            
            {/* Productivité */}
            <div className="animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
              <ProductivityWidget userId="1" stats={calculatedStats} />
            </div>
            
            {/* Section Recommandations */}
            <div className="animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl shadow-sm border border-indigo-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-indigo-900">🤖 Assistant IA</h3>
                    <p className="text-sm text-indigo-600">Obtenez des recommandations personnalisées</p>
                  </div>
                  <button
                    onClick={() => setShowRecommendations(!showRecommendations)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    {showRecommendations ? 'Masquer' : 'Recommandations'}
                  </button>
                </div>
                
                {/* Widget de recommandations */}
                {showRecommendations && (
                  <div className="mt-4">
                    <RecommendationWidget />
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Colonne 2: Tâches du jour et widgets complémentaires (occupe 1/3 de l'espace) */}
          <div className="md:col-span-1 space-y-4 md:space-y-6">
            {/* Tâches d'aujourd'hui */}
            <div className="animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
              <TodayTodoWidget 
                tasks={safeTasks} 
                onTaskUpdate={onTaskUpdate}
                stats={calculatedStats} 
              />
            </div>
            
            {/* Events Google Calendar du jour */}
            {googleEvents.length > 0 && (
              <div className="animate-fadeInUp" style={{ animationDelay: '0.6s' }}>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">🗓️ Événements Google</h3>
                  <ul className="space-y-3">
                  {googleEvents.map(event => (
                      <li key={event.id} className="flex items-center p-3 bg-blue-50 rounded-lg">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">{event.summary}</p>
                      {event.start && event.start.dateTime && (
                            <p className="text-xs text-gray-500">
                              {new Date(event.start.dateTime).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </p>
                      )}
                        </div>
                    </li>
                  ))}
                </ul>
                </div>
              </div>
            )}
            
            {/* Objectifs du jour */}
            <div className="animate-fadeInUp" style={{ animationDelay: '0.8s' }}>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">🎯 Focus du jour</h3>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {new Date().toLocaleDateString('fr-FR', { weekday: 'short' })}
                  </span>
                </div>
                
                <div className="space-y-3">
                  {/* Objectif principal */}
                  <div className="p-3 bg-amber-50 rounded-lg border-l-4 border-amber-400">
                    <p className="text-sm font-medium text-amber-800">Objectif principal</p>
                    <p className="text-xs text-amber-600 mt-1">
                      {safeTasks.length > 0 
                        ? `Terminer ${Math.min(3, safeTasks.filter(t => !t.completed).length)} tâches importantes`
                        : "Générer vos premières tâches"
                      }
                    </p>
                  </div>
                  
                  {/* Temps de focus */}
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                      <div>
                        <p className="text-sm font-medium text-blue-800">Temps de focus</p>
                        <p className="text-xs text-blue-600">25 min recommandées</p>
                      </div>
                    </div>
                    <button className="text-blue-600 hover:text-blue-800 text-xs bg-blue-100 px-3 py-1 rounded-full transition-colors">
                      Start 🍅
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Historique rapide */}
            {safeTasks.filter(t => t.completed).length > 0 && (
              <div className="animate-fadeInUp" style={{ animationDelay: '0.9s' }}>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">✅ Récemment terminées</h3>
                  <div className="space-y-2">
                    {safeTasks
                      .filter(task => task.completed)
                      .slice(0, 3)
                      .map(task => (
                        <div key={task.id} className="flex items-center p-2 bg-green-50 rounded-lg">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                          <p className="text-sm text-green-800 truncate">
                            {task.text.length > 35 ? task.text.slice(0, 32) + '...' : task.text}
                          </p>
                    </div>
                      ))}
                  </div>
                  
                  {safeTasks.filter(t => t.completed).length > 3 && (
                    <div className="mt-3 text-center">
                      <span className="text-xs text-gray-500">
                        +{safeTasks.filter(t => t.completed).length - 3} autres terminées
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Mini stats rapides */}
            <div className="animate-fadeInUp" style={{ animationDelay: '1.0s' }}>
              <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">📊 Résumé rapide</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-white rounded-lg">
                    <p className="text-lg font-bold text-gray-800">
                      {new Date().toLocaleDateString('fr-FR', { day: 'numeric' })}
                    </p>
                    <p className="text-xs text-gray-500">Jour du mois</p>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg">
                    <p className="text-lg font-bold text-purple-600">
                      {Math.floor(Math.random() * 85) + 15}%
                    </p>
                    <p className="text-xs text-gray-500">Score IA</p>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-white rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Énergie du jour</span>
                    <div className="flex space-x-1">
                      {[1,2,3,4,5].map(i => (
                        <div 
                          key={i} 
                          className={`w-2 h-2 rounded-full ${
                            i <= 4 ? 'bg-green-400' : 'bg-gray-200'
                          }`}
                      />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Modale calendrier */}
        {showCalendarModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-xl shadow-lg p-6 max-w-lg w-full relative mx-4">
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                onClick={() => setShowCalendarModal(false)}
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <CalendarWidget tasks={safeTasks} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 