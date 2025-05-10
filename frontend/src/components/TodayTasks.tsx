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

interface TodayTasksProps {
  tasks: Task[];
  onTaskUpdate: (taskId: number | string, updates: Partial<Task>) => void;
  onTaskDelete: (taskId: number | string) => void;
  isLoading?: boolean;
}

const TodayTasks: React.FC<TodayTasksProps> = ({
  tasks = [],
  onTaskUpdate,
  onTaskDelete,
  isLoading = false
}) => {
  const [todayTasks, setTodayTasks] = useState<Task[]>([]);

  useEffect(() => {
    // Fonction pour vérifier si une date correspond à aujourd'hui
    const isToday = (dateStr: string): boolean => {
      // Extraire la date du format "DD mois YYYY"
      const today = new Date();
      const todayDay = today.getDate();
      const todayMonth = today.getMonth() + 1; // getMonth retourne 0-11
      const todayYear = today.getFullYear();
      
      // Liste des mois en français pour l'extraction
      const frenchMonths: { [key: string]: number } = {
        'janvier': 1, 'février': 2, 'mars': 3, 'avril': 4, 'mai': 5, 'juin': 6,
        'juillet': 7, 'août': 8, 'septembre': 9, 'octobre': 10, 'novembre': 11, 'décembre': 12
      };
      
      // Tentative d'extraction de la date
      try {
        const parts = dateStr.split(' ');
        if (parts.length >= 3) {
          const day = parseInt(parts[0], 10);
          const month = frenchMonths[parts[1].toLowerCase()];
          const year = parseInt(parts[2], 10);
          
          return day === todayDay && month === todayMonth && year === todayYear;
        }
        return false;
      } catch (error) {
        return false;
      }
    };

    // Filtrer les tâches d'aujourd'hui
    const filteredTasks = tasks.filter(task => 
      !task.completed && 
      task.deadline && 
      isToday(task.deadline)
    );
    
    // Trier par priorité: high > medium > low
    const sortedTasks = [...filteredTasks].sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      const aPriority = a.priority ? priorityOrder[a.priority] : 3;
      const bPriority = b.priority ? priorityOrder[b.priority] : 3;
      
      return aPriority - bPriority;
    });
    
    setTodayTasks(sortedTasks);
  }, [tasks]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-6">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-xl font-bold mb-4">Tâches du jour</h2>
      
      {todayTasks.length > 0 ? (
        <div className="space-y-3">
          {todayTasks.map(task => (
            <Todo
              key={task.id}
              id={task.id}
              title={task.title}
              completed={task.completed}
              deadline={task.deadline}
              category={task.category}
              priority={task.priority}
              onToggle={onTaskUpdate}
              onDelete={onTaskDelete}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-4 text-gray-500">
          <p>Aucune tâche pour aujourd'hui</p>
        </div>
      )}
    </div>
  );
};

export default TodayTasks; 