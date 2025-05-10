import React, { useState, useEffect } from 'react';

const TaskList = ({ tasks = [], onTaskUpdate, onTaskDelete, isLoading }) => {
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Mettre à jour les tâches filtrées lorsque les tasks changent ou les filtres sont modifiés
  useEffect(() => {
    let result = [...tasks];
    
    // Appliquer le filtre
    if (activeFilter === 'completed') {
      result = result.filter(task => task.completed);
    } else if (activeFilter === 'pending') {
      result = result.filter(task => !task.completed);
    } else if (activeFilter === 'important') {
      result = result.filter(task => task.eisenhower?.includes('important'));
    } else if (activeFilter === 'urgent') {
      result = result.filter(task => task.eisenhower?.includes('urgent'));
    }
    
    // Appliquer la recherche
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(task => 
        task.text.toLowerCase().includes(term) || 
        (task.hashtags && task.hashtags.some(tag => tag.toLowerCase().includes(term)))
      );
    }
    
    setFilteredTasks(result);
  }, [tasks, activeFilter, searchTerm]);

  const handleTaskToggle = (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      onTaskUpdate(taskId, { completed: !task.completed });
    }
  };

  // Obtenir une couleur de fond en fonction de la priorité Eisenhower
  const getEisenhowerStyle = (eisenhower) => {
    if (!eisenhower) return {};
    
    switch (eisenhower) {
      case 'important_urgent':
        return { borderLeft: '4px solid #ef4444' }; // Rouge
      case 'important_not_urgent':
        return { borderLeft: '4px solid #f59e0b' }; // Orange
      case 'not_important_urgent':
        return { borderLeft: '4px solid #3b82f6' }; // Bleu
      case 'not_important_not_urgent':
        return { borderLeft: '4px solid #10b981' }; // Vert
      default:
        return {};
    }
  };

  // Traduire Eisenhower en français et obtenir une couleur de texte
  const getEisenhowerLabel = (eisenhower) => {
    if (!eisenhower) return null;
    
    let label = '';
    let textColor = '';
    
    switch (eisenhower) {
      case 'important_urgent':
        label = 'Important & Urgent';
        textColor = 'text-red-600';
        break;
      case 'important_not_urgent':
        label = 'Important & Non Urgent';
        textColor = 'text-amber-600';
        break;
      case 'not_important_urgent':
        label = 'Non Important & Urgent';
        textColor = 'text-blue-600';
        break;
      case 'not_important_not_urgent':
        label = 'Non Important & Non Urgent';
        textColor = 'text-emerald-600';
        break;
      default:
        return null;
    }
    
    return <span className={`text-xs font-medium ${textColor}`}>{label}</span>;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>Aucune tâche disponible</p>
      </div>
    );
  }

  return (
    <div>
      {/* Filtres et recherche */}
      <div className="mb-6 space-y-4">
        {/* Filtres par état */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              activeFilter === 'all'
                ? 'bg-black text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Toutes
          </button>
          <button
            onClick={() => setActiveFilter('pending')}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              activeFilter === 'pending'
                ? 'bg-black text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            À faire
          </button>
          <button
            onClick={() => setActiveFilter('completed')}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              activeFilter === 'completed'
                ? 'bg-black text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Terminées
          </button>
          <button
            onClick={() => setActiveFilter('important')}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              activeFilter === 'important'
                ? 'bg-black text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Importantes
          </button>
          <button
            onClick={() => setActiveFilter('urgent')}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              activeFilter === 'urgent'
                ? 'bg-black text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Urgentes
          </button>
        </div>
        
        {/* Recherche */}
        <div className="relative">
          <input
            type="text"
            placeholder="Rechercher une tâche..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-black focus:border-black"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          {searchTerm && (
            <button
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              onClick={() => setSearchTerm('')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>
      
      {/* Liste des tâches */}
      {filteredTasks.length > 0 ? (
        <ul className="space-y-3">
          {filteredTasks.map((task) => (
            <li 
              key={task.id} 
              className="p-4 bg-white border border-gray-200 rounded-lg transition-shadow hover:shadow-md"
              style={getEisenhowerStyle(task.eisenhower)}
            >
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => handleTaskToggle(task.id)}
                    className="h-5 w-5 rounded border-gray-300 text-black focus:ring-black"
                  />
                </div>
                <div className="ml-3 flex-1">
                  <div className={`${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                    {task.text}
                  </div>
                  
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {/* Tags */}
                    {task.hashtags && task.hashtags.map((tag, idx) => (
                      <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                        #{tag}
                      </span>
                    ))}
                    
                    {/* Échéance */}
                    {task.deadline && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {task.deadline}
                      </span>
                    )}
                    
                    {/* Temps estimé */}
                    {task.estimated_time && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {task.estimated_time}
                      </span>
                    )}
                    
                    {/* Priorité Eisenhower */}
                    {getEisenhowerLabel(task.eisenhower)}
                  </div>
                </div>
                
                <button
                  onClick={() => onTaskDelete(task.id)}
                  className="ml-2 text-gray-400 hover:text-gray-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-center py-6 text-gray-500">
          <p>Aucune tâche ne correspond à vos critères</p>
        </div>
      )}
    </div>
  );
};

export default TaskList; 