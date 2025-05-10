import React, { useState, useEffect } from 'react';
import { taskService } from '../services/api';

const TodayTodoWidget = ({ tasks = [], onTaskUpdate }) => {
  const [todayTasks, setTodayTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Filtrer les tâches pour aujourd'hui
    const today = new Date().toISOString().split('T')[0]; // Format YYYY-MM-DD
    const filteredTasks = tasks.filter(task => {
      return task.deadline === today || (!task.completed && new Date(task.deadline) <= new Date());
    });
    
    setTodayTasks(filteredTasks);
  }, [tasks]);

  const handleToggleTask = (taskId) => {
    if (onTaskUpdate) {
      const task = todayTasks.find(t => t.id === taskId);
      if (task) {
        onTaskUpdate(taskId, { completed: !task.completed });
      }
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Tâches d'aujourd'hui</h2>
        <div className="bg-red-500 text-white text-xs px-3 py-1 rounded-full">
          Aujourd'hui
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-6">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-black rounded-full animate-spin"></div>
        </div>
      ) : todayTasks.length === 0 ? (
        <div className="text-center py-6 text-gray-500">
          <p>Aucune tâche pour aujourd'hui</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {todayTasks.map(task => (
            <li key={task.id} className="flex items-start">
              <button
                onClick={() => handleToggleTask(task.id)}
                className={`flex-shrink-0 w-5 h-5 rounded-full border mt-1 ${
                  task.completed 
                    ? 'bg-purple-600 border-purple-600' 
                    : 'border-gray-300'
                }`}
              >
                {task.completed && (
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
              <div className="ml-3 flex-1">
                <p className={`text-sm font-medium ${task.completed ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                  {task.text}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {task.description || (task.hashtags && task.hashtags.join(', '))}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TodayTodoWidget; 