import React, { useState, useEffect } from 'react';
import { habitService } from '../services/api';

const Habits = () => {
  const [habits, setHabits] = useState([]);
  const [newHabit, setNewHabit] = useState({ name: '', target: 1, frequency: 'daily' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchHabits();
  }, []);

  const fetchHabits = async () => {
    try {
      setLoading(true);
      // Simuler des données d'habitudes pour l'instant
      const mockHabits = [
        {
          id: 1,
          name: "Méditation",
          target: 1,
          frequency: "daily",
          streak: 7,
          completions: [
            { date: "2025-05-30", completed: true },
            { date: "2025-05-29", completed: true },
            { date: "2025-05-28", completed: false },
          ]
        },
        {
          id: 2,
          name: "Exercice physique",
          target: 30,
          frequency: "daily",
          streak: 3,
          completions: [
            { date: "2025-05-30", completed: true },
            { date: "2025-05-29", completed: true },
            { date: "2025-05-28", completed: true },
          ]
        },
        {
          id: 3,
          name: "Lecture",
          target: 20,
          frequency: "daily", 
          streak: 12,
          completions: [
            { date: "2025-05-30", completed: true },
            { date: "2025-05-29", completed: false },
            { date: "2025-05-28", completed: true },
          ]
        }
      ];
      setHabits(mockHabits);
      setError(null);
    } catch (err) {
      console.error("Erreur lors du chargement des habitudes:", err);
      setError("Impossible de charger les habitudes.");
    } finally {
      setLoading(false);
    }
  };

  const addHabit = async () => {
    if (!newHabit.name.trim()) {
      setError("Le nom de l'habitude est requis");
      return;
    }

    try {
      const habit = {
        id: Date.now(),
        ...newHabit,
        streak: 0,
        completions: []
      };
      
      setHabits([...habits, habit]);
      setNewHabit({ name: '', target: 1, frequency: 'daily' });
      setError(null);
    } catch (err) {
      setError("Erreur lors de l'ajout de l'habitude");
    }
  };

  const toggleHabitCompletion = (habitId, date) => {
    setHabits(habits.map(habit => {
      if (habit.id === habitId) {
        const existingCompletion = habit.completions.find(c => c.date === date);
        let newCompletions;
        
        if (existingCompletion) {
          newCompletions = habit.completions.map(c => 
            c.date === date ? { ...c, completed: !c.completed } : c
          );
        } else {
          newCompletions = [...habit.completions, { date, completed: true }];
        }
        
        return { ...habit, completions: newCompletions };
      }
      return habit;
    }));
  };

  const getHabitCompletionForDate = (habit, date) => {
    const completion = habit.completions.find(c => c.date === date);
    return completion ? completion.completed : false;
  };

  const getStreakColor = (streak) => {
    if (streak >= 30) return 'text-purple-600';
    if (streak >= 14) return 'text-green-600';
    if (streak >= 7) return 'text-blue-600';
    if (streak >= 3) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const getCompletionRate = (habit) => {
    if (!habit.completions.length) return 0;
    const completed = habit.completions.filter(c => c.completed).length;
    return Math.round((completed / habit.completions.length) * 100);
  };

  return (
    <div className="py-8 px-4 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Suivi des habitudes</h1>
        <p className="text-gray-600">Développez de bonnes habitudes et suivez vos progrès au quotidien</p>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded mb-6">
          <p className="text-sm font-medium text-red-800">{error}</p>
        </div>
      )}

      {/* Formulaire d'ajout d'habitude */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Ajouter une nouvelle habitude</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom de l'habitude
            </label>
            <input
              type="text"
              value={newHabit.name}
              onChange={(e) => setNewHabit({...newHabit, name: e.target.value})}
              placeholder="Ex: Méditation"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Objectif quotidien
            </label>
            <input
              type="number"
              value={newHabit.target}
              onChange={(e) => setNewHabit({...newHabit, target: parseInt(e.target.value)})}
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fréquence
            </label>
            <select
              value={newHabit.frequency}
              onChange={(e) => setNewHabit({...newHabit, frequency: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="daily">Quotidien</option>
              <option value="weekly">Hebdomadaire</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={addHabit}
              className="w-full bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Ajouter
            </button>
          </div>
        </div>
      </div>

      {/* Sélecteur de date */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Suivi du jour</h2>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Liste des habitudes */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {habits.map((habit) => (
            <div key={habit.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{habit.name}</h3>
                  <p className="text-sm text-gray-500">
                    Objectif: {habit.target} {habit.frequency === 'daily' ? 'min/jour' : 'fois/semaine'}
                  </p>
                </div>
                <button
                  onClick={() => toggleHabitCompletion(habit.id, selectedDate)}
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                    getHabitCompletionForDate(habit, selectedDate)
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'border-gray-300 hover:border-green-400'
                  }`}
                >
                  {getHabitCompletionForDate(habit, selectedDate) && (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Statistiques */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Streak actuel</span>
                  <span className={`text-sm font-semibold ${getStreakColor(habit.streak)}`}>
                    🔥 {habit.streak} jours
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Taux de réussite</span>
                  <span className="text-sm font-semibold text-blue-600">
                    {getCompletionRate(habit)}%
                  </span>
                </div>

                {/* Barre de progression */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${getCompletionRate(habit)}%` }}
                  />
                </div>

                {/* Historique visuel des 7 derniers jours */}
                <div className="flex space-x-1 mt-4">
                  {Array.from({ length: 7 }).map((_, index) => {
                    const date = new Date();
                    date.setDate(date.getDate() - (6 - index));
                    const dateStr = date.toISOString().split('T')[0];
                    const isCompleted = getHabitCompletionForDate(habit, dateStr);
                    
                    return (
                      <div
                        key={index}
                        className={`w-6 h-6 rounded-sm ${
                          isCompleted ? 'bg-green-500' : 'bg-gray-200'
                        }`}
                        title={date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' })}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {habits.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="mb-4">
            <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune habitude pour le moment</h3>
          <p className="text-gray-500">Commencez par ajouter votre première habitude ci-dessus</p>
        </div>
      )}
    </div>
  );
};

export default Habits; 