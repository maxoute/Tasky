import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Icônes pour les tâches
const CheckIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const EditIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const DeleteIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const CloseIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const FuturisticTaskList = ({ tasks = [], onTaskUpdate, onTaskDelete }) => {
  const [expandedTask, setExpandedTask] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [hoveredTask, setHoveredTask] = useState(null);

  // Filtrer les tâches en fonction du statut
  const filteredTasks = tasks.filter(task => {
    if (filterStatus === 'completed') return task.completed;
    if (filterStatus === 'pending') return !task.completed;
    return true; // 'all'
  });

  // Animer l'action sur la tâche
  const handleTaskClick = (taskId) => {
    setExpandedTask(expandedTask === taskId ? null : taskId);
  };

  // Calculer le pourcentage de tâches complétées
  const completionPercentage = tasks.length 
    ? Math.round((tasks.filter(task => task.completed).length / tasks.length) * 100) 
    : 0;

  // Variantes pour les animations
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const taskVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.2 } }
  };

  // Badge de priorité
  const PriorityBadge = ({ priority }) => {
    const getBadgeClasses = () => {
      switch (priority?.toLowerCase()) {
        case 'high':
          return 'bg-black text-white';
        case 'medium':
          return 'bg-gray-700 text-white';
        case 'low':
          return 'bg-gray-400 text-white';
        default:
          return 'bg-gray-200 text-gray-800';
      }
    };

    return (
      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getBadgeClasses()}`}>
        {priority || 'Normal'}
      </span>
    );
  };

  return (
    <div className="neo-card p-5">
      {/* En-tête avec compteur et filtres */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-xl font-bold font-futuristic mb-1">Mes tâches</h2>
          <div className="flex items-center">
            <div className="w-full max-w-[120px] h-1.5 bg-gray-200 rounded-full mr-3">
              <div 
                className="h-full bg-black rounded-full" 
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
            <span className="text-sm text-gray-600">
              {completionPercentage}% complété
            </span>
          </div>
        </div>

        <div className="flex space-x-2">
          <button 
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 text-sm rounded-lg transition ${
              filterStatus === 'all' 
                ? 'bg-black text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Tout
          </button>
          <button 
            onClick={() => setFilterStatus('pending')}
            className={`px-3 py-1.5 text-sm rounded-lg transition ${
              filterStatus === 'pending' 
                ? 'bg-black text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            À faire
          </button>
          <button 
            onClick={() => setFilterStatus('completed')}
            className={`px-3 py-1.5 text-sm rounded-lg transition ${
              filterStatus === 'completed' 
                ? 'bg-black text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Terminé
          </button>
        </div>
      </div>

      {/* Liste des tâches */}
      {filteredTasks.length === 0 ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">Aucune tâche</h3>
          <p className="text-gray-500">
            {filterStatus === 'completed' 
              ? "Vous n'avez pas encore complété de tâches" 
              : filterStatus === 'pending' 
                ? "Aucune tâche en attente"
                : "Commencez par générer des tâches sur le tableau de bord"}
          </p>
        </div>
      ) : (
        <motion.ul 
          className="space-y-3"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          <AnimatePresence>
            {filteredTasks.map(task => (
              <motion.li 
                key={task.id} 
                variants={taskVariants}
                exit="exit"
                className={`relative border border-gray-200 rounded-xl p-4 transition-all duration-300 ${
                  expandedTask === task.id ? 'bg-gray-50' : 'bg-white'
                } ${
                  task.completed ? 'border-l-0' : 'border-l-4 border-l-black'
                }`}
                onMouseEnter={() => setHoveredTask(task.id)}
                onMouseLeave={() => setHoveredTask(null)}
              >
                <div className="flex items-center">
                  {/* Checkbox */}
                  <div 
                    onClick={() => onTaskUpdate(task.id, { completed: !task.completed })}
                    className={`flex-shrink-0 w-6 h-6 rounded-md cursor-pointer mr-3 flex items-center justify-center transition-colors ${
                      task.completed ? 'bg-black' : 'border-2 border-gray-300 hover:border-black'
                    }`}
                  >
                    {task.completed && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  
                  {/* Contenu de la tâche */}
                  <div className="flex-grow cursor-pointer" onClick={() => handleTaskClick(task.id)}>
                    <h3 className={`text-base font-medium mb-0.5 ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                      {task.title}
                    </h3>
                    
                    {/* Métadonnées (priorité, catégorie, etc.) */}
                    <div className="flex flex-wrap gap-2">
                      {task.category && (
                        <span className="text-xs text-gray-500 px-2 py-0.5 rounded-full bg-gray-100">
                          #{task.category}
                        </span>
                      )}
                      {task.priority && (
                        <PriorityBadge priority={task.priority} />
                      )}
                      {task.dueDate && (
                        <span className="text-xs text-gray-500 px-2 py-0.5 rounded-full bg-gray-100 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {task.dueDate}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Menu d'actions */}
                  <AnimatePresence>
                    {(hoveredTask === task.id || expandedTask === task.id) && (
                      <motion.div 
                        className="flex-shrink-0"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.15 }}
                      >
                        <button 
                          onClick={() => onTaskDelete(task.id)} 
                          className="text-gray-400 hover:text-red-500 transition p-1"
                          aria-label="Supprimer la tâche"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                
                {/* Description détaillée (visible uniquement si la tâche est développée) */}
                <AnimatePresence>
                  {expandedTask === task.id && task.description && (
                    <motion.div 
                      className="mt-3 pt-3 border-t border-gray-100"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <p className="text-gray-600 text-sm">{task.description}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      )}
    </div>
  );
};

export default FuturisticTaskList; 