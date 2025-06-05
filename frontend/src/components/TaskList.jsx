import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TaskList = ({ 
  tasks = [], 
  onTaskUpdate, 
  onTaskDelete, 
  isLoading = false,
  title = "Vos tâches"
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');
  const [sortBy, setSortBy] = useState('default');
  const [selectedTasks, setSelectedTasks] = useState(new Set());
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);

  // Filtrer et trier les tâches
  const filteredAndSortedTasks = React.useMemo(() => {
    let filtered = tasks.filter(task => {
      const matchesSearch = task.text.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPriority = filterPriority === 'all' || task.eisenhower_category === filterPriority;
      return matchesSearch && matchesPriority;
    });

    // Tri des tâches
    switch (sortBy) {
      case 'priority':
        return filtered.sort((a, b) => {
          const priorities = { urgent_important: 4, important_not_urgent: 3, urgent_not_important: 2, not_urgent_not_important: 1 };
          return (priorities[b.eisenhower_category] || 0) - (priorities[a.eisenhower_category] || 0);
        });
      case 'status':
        return filtered.sort((a, b) => (a.completed === b.completed) ? 0 : a.completed ? 1 : -1);
      case 'alphabetical':
        return filtered.sort((a, b) => a.text.localeCompare(b.text));
      default:
        return filtered;
    }
  }, [tasks, searchTerm, filterPriority, sortBy]);

  // Statistiques dynamiques
  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.completed).length,
    pending: tasks.filter(t => !t.completed).length,
    urgent: tasks.filter(t => t.eisenhower_category?.includes('urgent')).length
  };

  // Gestion de la sélection multiple
  const toggleTaskSelection = (taskId) => {
    const newSelected = new Set(selectedTasks);
    if (newSelected.has(taskId)) {
      newSelected.delete(taskId);
    } else {
      newSelected.add(taskId);
    }
    setSelectedTasks(newSelected);
  };

  const toggleMultiSelect = () => {
    setIsMultiSelectMode(!isMultiSelectMode);
    setSelectedTasks(new Set());
  };

  const bulkMarkComplete = () => {
    selectedTasks.forEach(taskId => {
      const task = tasks.find(t => t.id === taskId);
      if (task && !task.completed) {
        onTaskUpdate(taskId);
      }
    });
    setSelectedTasks(new Set());
    setIsMultiSelectMode(false);
  };

  const bulkDelete = () => {
    if (window.confirm(`Supprimer ${selectedTasks.size} tâche${selectedTasks.size > 1 ? 's' : ''} ?`)) {
      selectedTasks.forEach(taskId => onTaskDelete(taskId));
      setSelectedTasks(new Set());
      setIsMultiSelectMode(false);
    }
  };

  // Fonction pour obtenir l'emoji et la couleur selon la catégorie Eisenhower
  const getEisenhowerStyle = (category) => {
    switch (category) {
      case 'urgent_important':
        return { emoji: '🔥', color: 'bg-red-100 text-red-800 border-red-200', label: 'Urgent & Important' };
      case 'important_not_urgent':
        return { emoji: '⭐', color: 'bg-blue-100 text-blue-800 border-blue-200', label: 'Important' };
      case 'urgent_not_important':
        return { emoji: '⚡', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'Urgent' };
      case 'not_urgent_not_important':
        return { emoji: '📋', color: 'bg-gray-100 text-gray-800 border-gray-200', label: 'Normal' };
      default:
        return { emoji: '📝', color: 'bg-gray-100 text-gray-600 border-gray-200', label: 'Non catégorisé' };
    }
  };

  if (isLoading) {
    return (
      <div className="glass-card widget-container">
        <div className="animate-pulse">
          <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg mb-6 loading-shimmer"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex items-center space-x-4">
                <div className="w-5 h-5 bg-gray-200 rounded loading-shimmer"></div>
                <div className="flex-1 h-4 bg-gray-200 rounded loading-shimmer"></div>
                <div className="w-16 h-6 bg-gray-200 rounded loading-shimmer"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card widget-container">
      {/* Header avec titre et statistiques */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
              <p className="text-gray-600">
                {stats.total > 0 
                  ? `${stats.completed}/${stats.total} terminées • ${stats.pending} en cours`
                  : "Aucune tâche pour le moment"
                }
              </p>
            </div>
          </div>
          
          {/* Bouton multi-sélection */}
          {stats.total > 0 && (
            <button
              onClick={toggleMultiSelect}
              className={`btn-micro px-4 py-2 rounded-lg font-medium transition-all ${
                isMultiSelectMode 
                  ? 'bg-indigo-100 text-indigo-700' 
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-indigo-200'
              }`}
            >
              {isMultiSelectMode ? '✨ Multi-select' : '📋 Sélectionner'}
            </button>
          )}
        </div>

        {/* Barre de statistiques rapides */}
        {stats.total > 0 && (
          <div className="grid grid-cols-4 gap-3 mb-6">
            <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
              <div className="text-lg font-bold text-blue-700">{stats.total}</div>
              <div className="text-xs text-blue-600">Total</div>
            </div>
            <div className="text-center p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
              <div className="text-lg font-bold text-green-700">{stats.completed}</div>
              <div className="text-xs text-green-600">Terminées</div>
            </div>
            <div className="text-center p-3 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl">
              <div className="text-lg font-bold text-orange-700">{stats.pending}</div>
              <div className="text-xs text-orange-600">En cours</div>
            </div>
            <div className="text-center p-3 bg-gradient-to-br from-red-50 to-red-100 rounded-xl">
              <div className="text-lg font-bold text-red-700">{stats.urgent}</div>
              <div className="text-xs text-red-600">Urgentes</div>
            </div>
          </div>
        )}

        {/* Barre d'outils : recherche, filtres, tri */}
        {stats.total > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Recherche */}
            <div className="relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Rechercher une tâche..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-modern pl-10 w-full"
              />
            </div>

            {/* Filtre par priorité */}
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="input-modern"
            >
              <option value="all">Toutes les priorités</option>
              <option value="urgent_important">🔥 Urgent & Important</option>
              <option value="important_not_urgent">⭐ Important</option>
              <option value="urgent_not_important">⚡ Urgent</option>
              <option value="not_urgent_not_important">📋 Normal</option>
            </select>

            {/* Tri */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input-modern"
            >
              <option value="default">Tri par défaut</option>
              <option value="priority">Par priorité</option>
              <option value="status">Par statut</option>
              <option value="alphabetical">Alphabétique</option>
            </select>
          </div>
        )}

        {/* Actions de groupe quand multi-select actif */}
        {isMultiSelectMode && selectedTasks.size > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-4 mb-6"
          >
            <div className="flex items-center justify-between">
              <span className="text-indigo-700 font-medium">
                {selectedTasks.size} tâche{selectedTasks.size > 1 ? 's' : ''} sélectionnée{selectedTasks.size > 1 ? 's' : ''}
              </span>
              <div className="flex space-x-3">
                <button
                  onClick={bulkMarkComplete}
                  className="btn-micro bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
                >
                  ✅ Terminer
                </button>
                <button
                  onClick={bulkDelete}
                  className="btn-micro bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
                >
                  🗑️ Supprimer
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Liste des tâches */}
      {filteredAndSortedTasks.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
            {searchTerm || filterPriority !== 'all' ? (
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            ) : (
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            )}
          </div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            {searchTerm || filterPriority !== 'all' ? 'Aucun résultat' : 'Aucune tâche'}
          </h3>
          <p className="text-gray-500">
            {searchTerm || filterPriority !== 'all' 
              ? 'Essayez de modifier vos critères de recherche'
              : 'Commencez par générer vos premières tâches !'
            }
          </p>
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="space-y-3">
            {filteredAndSortedTasks.map((task, index) => {
              const eisenhowerStyle = getEisenhowerStyle(task.eisenhower_category);
              const isSelected = selectedTasks.has(task.id);
              
              return (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{ 
                    duration: 0.3, 
                    delay: index * 0.05,
                    layout: { duration: 0.2 }
                  }}
                  className={`stagger-item group p-4 rounded-xl border transition-all duration-300 ${
                    task.completed 
                      ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 opacity-80' 
                      : isSelected
                        ? 'bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-300 shadow-lg'
                        : 'bg-white border-gray-200 hover:border-indigo-200 hover:shadow-md hover-lift'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    {/* Checkbox avec animation */}
                    <div className="flex-shrink-0">
                      <button
                        onClick={() => {
                          if (isMultiSelectMode) {
                            toggleTaskSelection(task.id);
                          } else {
                            onTaskUpdate(task.id);
                          }
                        }}
                        className={`w-6 h-6 rounded-lg border-2 transition-all duration-300 flex items-center justify-center ${
                          task.completed 
                            ? 'bg-green-500 border-green-500 text-white'
                            : isSelected
                              ? 'bg-indigo-500 border-indigo-500 text-white'
                              : 'border-gray-300 hover:border-indigo-400 hover:bg-indigo-50'
                        }`}
                      >
                        {task.completed ? (
                          <motion.svg 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-4 h-4" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                          </motion.svg>
                        ) : isSelected ? (
                          <motion.svg 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-4 h-4" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                          </motion.svg>
                        ) : null}
                      </button>
                    </div>

                    {/* Contenu de la tâche */}
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium transition-all ${
                        task.completed 
                          ? 'text-green-800 line-through' 
                          : 'text-gray-800 group-hover:text-gray-900'
                      }`}>
                        {task.text}
                      </p>
                      
                      {/* Tags et métadonnées */}
                      <div className="flex items-center space-x-2 mt-2">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${eisenhowerStyle.color}`}>
                          <span className="mr-1">{eisenhowerStyle.emoji}</span>
                          {eisenhowerStyle.label}
                        </span>
                        
                        {task.estimated_duration && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-700 border border-purple-200">
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {task.estimated_duration}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!isMultiSelectMode && (
                        <>
                          <button
                            onClick={() => onTaskUpdate(task.id)}
                            className={`btn-micro p-2 rounded-lg transition-all ${
                              task.completed 
                                ? 'bg-orange-100 text-orange-600 hover:bg-orange-200' 
                                : 'bg-green-100 text-green-600 hover:bg-green-200'
                            }`}
                            title={task.completed ? "Marquer comme non terminée" : "Marquer comme terminée"}
                          >
                            {task.completed ? '↩️' : '✅'}
                          </button>
                          
                          <button
                            onClick={() => onTaskDelete(task.id)}
                            className="btn-micro p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-all"
                            title="Supprimer la tâche"
                          >
                            🗑️
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </AnimatePresence>
      )}
    </div>
  );
};

export default TaskList; 