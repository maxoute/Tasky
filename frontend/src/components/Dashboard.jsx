import React, { useState } from 'react';
import ThemeGenerator from './ThemeGenerator';
import TaskList from './TaskList';
import RecommendationWidget from './RecommendationWidget';
import TodayTodoWidget from './TodayTodoWidget';
import CalendarWidget from './CalendarWidget';
import ProductivityWidget from './ProductivityWidget';

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

  // S'assurer que tasks est toujours un tableau
  const safeTasks = Array.isArray(tasks) ? tasks : [];
  
  const totalTasks = stats?.totalTasks || 0;
  const completedTasks = stats?.completedTasks || 0;
  const progressPercentage = totalTasks > 0 
    ? Math.round((completedTasks / totalTasks) * 100) 
    : 0;
  
  return (
    <div className="pt-6 pb-12 px-4 md:px-6">
      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne 1: Générateur et Productivité (occupe 2/3 de l'espace) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Générateur de tâches */}
            <ThemeGenerator 
              onTasksGenerated={onGenerateTasks} 
            />
            
            {/* Productivité */}
            <ProductivityWidget userId="1" />
          </div>
          
          {/* Colonne 2: Tâches du jour, calendrier et vue d'ensemble (occupe 1/3 de l'espace) */}
          <div className="lg:col-span-1 space-y-6">
            {/* Tâches d'aujourd'hui */}
            <TodayTodoWidget tasks={safeTasks} onTaskUpdate={onTaskUpdate} />
            
            {/* Calendrier */}
            <CalendarWidget tasks={safeTasks} />
            
            {/* Vue d'ensemble */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
              <h2 className="text-xl font-semibold mb-4">Vue d'ensemble</h2>
              
              {safeTasks.length > 0 ? (
                <>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <p className="text-3xl font-bold text-black">{stats.total}</p>
                      <p className="text-sm text-gray-500">Tâches</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <p className="text-3xl font-bold text-black">{stats.completed}</p>
                      <p className="text-sm text-gray-500">Terminées</p>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progression</span>
                      <span className="font-medium">
                        {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-black transition-all duration-500"
                        style={{ 
                          width: `${stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}%` 
                        }}
                      />
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  Générez des tâches pour voir vos statistiques
                </p>
              )}
              
              <div className="mt-6">
                <button
                  onClick={() => setShowRecommendations(!showRecommendations)}
                  className="w-full border border-gray-300 text-gray-700 rounded-md px-4 py-2 hover:bg-gray-50 transition-colors"
                >
                  {showRecommendations ? 'Masquer les recommandations' : 'Obtenir des recommandations'}
                </button>
              </div>
            </div>
            
            {/* Widget de recommandations */}
            {showRecommendations && (
              <RecommendationWidget />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 