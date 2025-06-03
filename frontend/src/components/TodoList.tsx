import React, { useState, useEffect } from 'react';
import Todo from './Todo';

interface Task {
  id: number | string;
  title: string;
  completed: boolean;
  deadline?: string;
  category?: string;
  priority?: 'low' | 'medium' | 'high';
}

interface TodoListProps {
  tasks: Task[];
  onTaskUpdate: (taskId: number | string, updates: Partial<Task>) => void;
  onTaskDelete: (taskId: number | string) => void;
  isLoading?: boolean;
}

const TodoList: React.FC<TodoListProps> = ({ 
  tasks = [], 
  onTaskUpdate, 
  onTaskDelete, 
  isLoading = false 
}) => {
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Mettre à jour les tâches filtrées lorsque les tasks changent ou les filtres sont modifiés
  useEffect(() => {
    let result = [...tasks];
    
    // Appliquer le filtre
    if (activeFilter === 'completed') {
      result = result.filter(task => task.completed);
    } else if (activeFilter === 'pending') {
      result = result.filter(task => !task.completed);
    } else if (activeFilter === 'high') {
      result = result.filter(task => task.priority === 'high');
    } else if (activeFilter === 'medium') {
      result = result.filter(task => task.priority === 'medium');
    } else if (activeFilter === 'low') {
      result = result.filter(task => task.priority === 'low');
    }
    
    // Appliquer la recherche
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(task => 
        task.title.toLowerCase().includes(term) || 
        (task.category && task.category.toLowerCase().includes(term))
      );
    }
    
    setFilteredTasks(result);
  }, [tasks, activeFilter, searchTerm]);

  const handleTaskToggle = (taskId: number | string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      onTaskUpdate(taskId, { completed: !task.completed });
    }
  };

  const handleMoveToBottom = (taskId: number | string) => {
    const taskToMove = tasks.find(task => task.id === taskId);
    if (taskToMove) {
      const newTasks = [
        ...tasks.filter(task => task.id !== taskId),
        taskToMove
      ];
      // Nous créons une copie mise à jour pour simuler un déplacement
      // sans modifier l'ordre réel des tâches (qui est géré par le parent)
      setFilteredTasks(newTasks);
    }
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
            onClick={() => setActiveFilter('high')}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              activeFilter === 'high'
                ? 'bg-black text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Priorité haute
          </button>
          <button
            onClick={() => setActiveFilter('medium')}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              activeFilter === 'medium'
                ? 'bg-black text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Priorité moyenne
          </button>
          <button
            onClick={() => setActiveFilter('low')}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              activeFilter === 'low'
                ? 'bg-black text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Priorité basse
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
        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <Todo 
              key={task.id}
              id={task.id}
              title={task.title}
              completed={task.completed}
              deadline={task.deadline}
              category={task.category}
              priority={task.priority}
              onToggle={handleTaskToggle}
              onDelete={onTaskDelete}
              onMoveToBottom={handleMoveToBottom}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p>Aucune tâche ne correspond à votre recherche</p>
        </div>
      )}
    </div>
  );
};

export default TodoList; 