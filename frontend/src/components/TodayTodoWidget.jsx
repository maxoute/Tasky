import React, { useState } from 'react';

const TodayTodoWidget = ({ tasks = [], onTaskUpdate, stats, showDetailedStats = false }) => {
  const [showScript, setShowScript] = useState({});
  
  // Filtrer les tâches importantes du jour (non terminées)
  const todayTasks = tasks.filter(task => !task.completed);
  const recentlyCompleted = tasks.filter(task => task.completed).slice(0, 3);

  const handleToggleTask = (taskId) => {
    if (onTaskUpdate) {
      onTaskUpdate(taskId, { completed: !tasks.find(t => t.id === taskId)?.completed });
    }
  };

  const toggleScript = (taskId) => {
    setShowScript(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  // Fonction pour raccourcir le texte
  const shortTitle = (text) => text.length > 50 ? text.slice(0, 47) + '...' : text;

  // Obtenir le style de priorité Eisenhower
  const getEisenhowerStyle = (category) => {
    switch (category) {
      case 'urgent_important':
        return { emoji: '🔥', color: 'bg-red-100 text-red-700 border-red-200' };
      case 'important_not_urgent':
        return { emoji: '⭐', color: 'bg-blue-100 text-blue-700 border-blue-200' };
      case 'urgent_not_important':
        return { emoji: '⚡', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' };
      case 'not_urgent_not_important':
        return { emoji: '📋', color: 'bg-gray-100 text-gray-700 border-gray-200' };
      default:
        return { emoji: '📝', color: 'bg-gray-100 text-gray-600 border-gray-200' };
    }
  };

  if (!tasks || tasks.length === 0) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Vidéos à tourner</h2>
        </div>
        
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-600 mb-2">Aucune vidéo à tourner</h3>
          <p className="text-gray-500">Commencez par planifier vos premières vidéos pour l'academy !</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header avec titre */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Vidéos à tourner</h2>
        <p className="text-gray-600 mb-4">
          {stats?.completed || 0}/{stats?.total || 0} terminées
        </p>

        {/* Statistiques détaillées */}
        {showDetailedStats && stats?.total > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-blue-700 font-medium">Total</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
              <div className="text-sm text-green-700 font-medium">Terminées</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
              <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
              <div className="text-sm text-orange-700 font-medium">En cours</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="text-2xl font-bold text-purple-600">{Math.round(((stats.completed / stats.total) * 100) || 0)}%</div>
              <div className="text-sm text-purple-700 font-medium">Progression</div>
            </div>
          </div>
        )}
        
        {/* Progress bar simple */}
        {stats?.total > 0 && (
          <div className="flex items-center space-x-3">
            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500 transition-all duration-300"
                style={{ width: `${((stats.completed / stats.total) * 100) || 0}%` }}
              ></div>
            </div>
            <span className="text-sm font-medium text-gray-600">
              {Math.round(((stats.completed / stats.total) * 100) || 0)}%
            </span>
          </div>
        )}
      </div>

      {/* Tâches à faire */}
      {todayTasks.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-700 mb-3">À faire</h3>
          <ul className="space-y-2">
            {todayTasks.slice(0, 8).map((task) => {
              const eisenhowerStyle = getEisenhowerStyle(task.eisenhower_category);
              
              return (
                <li key={task.id} className="group">
                  <div className="flex items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors">
                    {/* Checkbox */}
                    <button
                      onClick={() => handleToggleTask(task.id)}
                      className="flex-shrink-0 w-5 h-5 rounded border-2 border-gray-300 hover:border-green-500 mr-3 flex items-center justify-center transition-colors"
                    >
                      {task.completed && (
                        <svg className="w-3 h-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                    
                    {/* Contenu */}
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                        {shortTitle(task.text)}
                      </p>
                      
                      {/* Tags */}
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${eisenhowerStyle.color}`}>
                          <span className="mr-1">{eisenhowerStyle.emoji}</span>
                          {eisenhowerStyle.emoji === '🔥' ? 'Urgent' : 
                           eisenhowerStyle.emoji === '⭐' ? 'Important' : 
                           eisenhowerStyle.emoji === '⚡' ? 'Urgent' : 'Normal'}
                        </span>
                        
                        {task.category && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-700 border border-blue-200">
                            📹 {task.category}
                          </span>
                        )}
                        
                        {task.estimated_duration && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-purple-100 text-purple-700 border border-purple-200">
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {task.estimated_duration}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                      {task.script && (
                        <button
                          onClick={() => toggleScript(task.id)}
                          className="px-3 py-1 text-xs bg-indigo-100 text-indigo-700 rounded border border-indigo-200 hover:bg-indigo-200 transition-colors"
                        >
                          📝 Script
                        </button>
                      )}
                      <button
                        onClick={() => handleToggleTask(task.id)}
                        className="p-1 text-green-600 hover:text-green-700"
                        title="Marquer comme terminée"
                      >
                        ✓
                      </button>
                    </div>
                  </div>
                  
                  {/* Script de la vidéo */}
                  {task.script && showScript[task.id] && (
                    <div className="mt-3 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-800">📝 Script de la vidéo</h4>
                        <button
                          onClick={() => toggleScript(task.id)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-line">
                        {task.script}
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
          
          {todayTasks.length > 8 && (
            <div className="mt-3 text-center">
              <button className="text-sm text-blue-600 hover:text-blue-700">
                Voir {todayTasks.length - 8} tâches de plus
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tâches récemment terminées */}
      {recentlyCompleted.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-gray-700 mb-3">Récemment terminées</h3>
          <ul className="space-y-2">
            {recentlyCompleted.map((task) => (
              <li key={task.id}>
                <div className="flex items-center p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-sm text-green-800 font-medium flex-1">
                    {shortTitle(task.text)}
                  </p>
                  <button
                    onClick={() => handleToggleTask(task.id)}
                    className="text-orange-600 hover:text-orange-700 text-sm"
                    title="Marquer comme non terminée"
                  >
                    ↩️
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Aucune tâche à faire */}
      {todayTasks.length === 0 && tasks.filter(t => t.completed).length > 0 && (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-green-600 mb-2">Toutes les vidéos tournées ! 🎉</h3>
          <p className="text-gray-500">Excellent travail ! Vous avez terminé toutes vos vidéos pour l'Orra Academy.</p>
        </div>
      )}
    </div>
  );
};

export default TodayTodoWidget; 