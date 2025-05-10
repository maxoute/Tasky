import React from 'react';

interface TodoProps {
  id: number | string;
  title: string;
  completed: boolean;
  deadline?: string;
  category?: string;
  priority?: 'low' | 'medium' | 'high';
  onToggle: (id: number | string) => void;
  onDelete: (id: number | string) => void;
  onMoveToBottom?: (id: number | string) => void;
}

const Todo: React.FC<TodoProps> = ({
  id,
  title,
  completed,
  deadline,
  category,
  priority = 'medium',
  onToggle,
  onDelete,
  onMoveToBottom
}) => {
  // Fonction pour déterminer la couleur de priorité
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Fonction pour obtenir la couleur de catégorie
  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'vidéo': return 'bg-blue-500 text-white';
      case 'organisation': return 'bg-purple-500 text-white';
      case 'productivité': return 'bg-green-500 text-white';
      case 'travailler': return 'bg-indigo-500 text-white';
      case 'suivi personnel': return 'bg-pink-500 text-white';
      case 'automatisation': return 'bg-orange-500 text-white';
      case 'marketing': return 'bg-orange-500 text-white';
      case 'technique': return 'bg-gray-700 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className="p-4 bg-white border border-gray-200 rounded-lg transition-shadow hover:shadow-md">
      <div className="flex items-start">
        <div className="flex-shrink-0 mt-1">
          <input
            type="checkbox"
            checked={completed}
            onChange={() => onToggle(id)}
            className="h-5 w-5 rounded border-gray-300 text-black focus:ring-black"
          />
        </div>
        <div className="ml-3 flex-1">
          <div className={`${completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
            {title}
          </div>
          
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {/* Deadline */}
            {deadline && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {deadline}
              </span>
            )}
            
            {/* Catégorie */}
            {category && (
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getCategoryColor(category)}`}>
                {category}
              </span>
            )}
            
            {/* Priorité */}
            {priority && (
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(priority)}`}>
                {priority === 'high' ? 'Haute' : priority === 'medium' ? 'Moyenne' : 'Basse'}
              </span>
            )}
          </div>
        </div>
        
        <div className="ml-2 flex space-x-2">
          {onMoveToBottom && (
            <button 
              onClick={() => onMoveToBottom(id)}
              className="text-gray-400 hover:text-gray-600"
              title="Déplacer en bas"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
              </svg>
            </button>
          )}
          <button 
            onClick={() => onDelete(id)}
            className="text-red-400 hover:text-red-600"
            title="Supprimer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Todo; 