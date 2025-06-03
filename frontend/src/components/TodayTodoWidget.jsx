import React, { useState, useEffect } from 'react';
import { taskService, addGoogleEvent } from '../services/api';

const TodayTodoWidget = ({ tasks = [], onTaskUpdate, stats }) => {
  const [todayTasks, setTodayTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Filtrer pour ne garder que les tâches non terminées
    const incompleteTasks = tasks.filter(task => !task.completed);
    console.log(`📋 [TodayTodoWidget] ${tasks.length} tâches reçues, ${incompleteTasks.length} non terminées affichées`);
    setTodayTasks(incompleteTasks);
  }, [tasks]);

  const handleToggleTask = (taskId) => {
    if (onTaskUpdate) {
      const task = todayTasks.find(t => t.id === taskId);
      if (task) {
        onTaskUpdate(taskId, { completed: !task.completed });
      }
    }
  };

  const shortTitle = (text) => text.length > 40 ? text.slice(0, 37) + '...' : text;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Tâches d'aujourd'hui</h2>
        <div className="bg-red-500 text-white text-xs px-3 py-1 rounded-full">
          Aujourd'hui
        </div>
      </div>

      {/* Statistiques rapides en haut */}
      {stats && stats.total > 0 && (
        <div className="mb-6 pb-4 border-b border-gray-100">
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
              <p className="text-xs text-gray-500">Total</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              <p className="text-xs text-gray-500">Terminées</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
              <p className="text-xs text-gray-500">En cours</p>
            </div>
          </div>
          
          {/* Barre de progression */}
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Progression</span>
              <span className="font-medium">{stats.completionRate}%</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-500"
                style={{ width: `${stats.completionRate}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-6">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-black rounded-full animate-spin"></div>
        </div>
      ) : todayTasks.length === 0 ? (
        <div className="text-center py-6 text-gray-500">
          <div className="mb-3">
            <svg className="w-12 h-12 mx-auto text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12l2 2 4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="font-medium">Toutes les tâches sont terminées !</p>
          <p className="text-sm mt-1">Félicitations 🎉</p>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-700">Tâches en cours</h3>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {todayTasks.length} restante{todayTasks.length > 1 ? 's' : ''}
            </span>
          </div>
          
          <ul className="space-y-3">
          {todayTasks.map(task => (
              <li key={task.id} className="flex items-start group hover:bg-gray-50 p-2 rounded-lg transition-colors">
              <button
                onClick={() => handleToggleTask(task.id)}
                  className={`flex-shrink-0 w-5 h-5 rounded-full border mt-1 transition-all ${
                  task.completed 
                      ? 'bg-green-600 border-green-600' 
                      : 'border-gray-300 hover:border-green-400'
                }`}
              >
                {task.completed && (
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
                <div className="ml-3 flex-1 min-w-0">
                <p
                  className={`text-sm font-medium ${task.completed ? 'text-gray-400 line-through' : 'text-gray-800'}`}
                  title={task.text}
                >
                  {shortTitle(task.text)}
                </p>
                  <div className="flex items-center mt-1 space-x-2">
                    <p className="text-xs text-gray-400">
                  {task.description || (task.hashtags && task.hashtags.join(', '))}
                </p>
                    {task.eisenhower && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        task.eisenhower === 'important_urgent' ? 'bg-red-100 text-red-700' :
                        task.eisenhower === 'important_not_urgent' ? 'bg-yellow-100 text-yellow-700' :
                        task.eisenhower === 'not_important_urgent' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {task.eisenhower === 'important_urgent' ? 'Urgent' :
                         task.eisenhower === 'important_not_urgent' ? 'Important' :
                         task.eisenhower === 'not_important_urgent' ? 'À déléguer' :
                         'À planifier'}
                      </span>
                    )}
                  </div>
              </div>
              <button
                onClick={async () => {
                  try {
                      await addGoogleEvent({ 
                        summary: task.text, 
                        description: task.description || '', 
                        start: task.deadline 
                      });
                    alert('Tâche ajoutée à Google Calendar !');
                  } catch (e) {
                    alert('Erreur lors de l\'ajout à Google Calendar');
                  }
                }}
                  className="opacity-0 group-hover:opacity-100 ml-2 text-xs text-blue-600 hover:text-blue-800 transition-all"
              >
                  📅
              </button>
            </li>
          ))}
        </ul>
        </div>
      )}
    </div>
  );
};

export default TodayTodoWidget; 