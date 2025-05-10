import React, { useState, useEffect } from 'react';
import { habitService } from '../services/api';

const HabitTracker = ({ userId = '1' }) => {
  const [habits, setHabits] = useState([]);
  const [habitStats, setHabitStats] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [newHabit, setNewHabit] = useState({
    user_id: userId,
    name: '',
    description: '',
    frequency: 'daily',
    target_value: 1,
    unit: 'fois',
    color: '#000000'
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [activePeriod, setActivePeriod] = useState('month');

  useEffect(() => {
    fetchHabits();
    fetchHabitStats();
  }, [userId, activePeriod]);

  const fetchHabits = async () => {
    try {
      setIsLoading(true);
      const response = await habitService.getUserHabits(userId);
      setHabits(response || []);
    } catch (error) {
      console.error('Erreur lors de la récupération des habitudes:', error);
      setHabits([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchHabitStats = async () => {
    try {
      const stats = await habitService.getHabitStats(userId, null, activePeriod);
      setHabitStats(stats);
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await habitService.addHabit(newHabit);
      setNewHabit({
        user_id: userId,
        name: '',
        description: '',
        frequency: 'daily',
        target_value: 1,
        unit: 'fois',
        color: '#000000'
      });
      setShowAddForm(false);
      fetchHabits();
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'habitude:', error);
    }
  };

  const handleLogHabit = async (habitId, value = 1) => {
    const today = new Date().toISOString().split('T')[0];
    
    try {
      await habitService.addHabitEntry({
        habit_id: habitId,
        date: today,
        value: value
      });
      fetchHabitStats();
    } catch (error) {
      console.error('Erreur lors de la saisie de l\'habitude:', error);
    }
  };

  const handleDeleteHabit = async (habitId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette habitude et toutes ses entrées ?')) {
      try {
        await habitService.deleteHabit(habitId);
        fetchHabits();
        fetchHabitStats();
      } catch (error) {
        console.error('Erreur lors de la suppression de l\'habitude:', error);
      }
    }
  };

  // Formater le pourcentage de complétion
  const formatCompletionRate = (rate) => {
    return `${Math.round(rate)}%`;
  };

  // Obtenir la couleur en fonction du taux de complétion
  const getCompletionColor = (rate) => {
    if (rate >= 80) return 'bg-green-500';
    if (rate >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="py-6 flex-1 overflow-y-auto">
      <div className="container-responsive">
        {/* En-tête */}
        <header className="mb-8">
          <div className="animate-fadeInUp">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Suivi des habitudes
            </h1>
            <p className="mt-2 text-lg text-gray-600">
              Suivez vos habitudes quotidiennes et développez de nouveaux comportements positifs
            </p>
          </div>
        </header>

        {/* Boutons de période */}
        <div className="mb-6 flex space-x-2 animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
          <button 
            onClick={() => setActivePeriod('week')}
            className={`px-4 py-2 rounded-md ${activePeriod === 'week' ? 'bg-black text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
          >
            Semaine
          </button>
          <button 
            onClick={() => setActivePeriod('month')}
            className={`px-4 py-2 rounded-md ${activePeriod === 'month' ? 'bg-black text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
          >
            Mois
          </button>
          <button 
            onClick={() => setActivePeriod('year')}
            className={`px-4 py-2 rounded-md ${activePeriod === 'year' ? 'bg-black text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
          >
            Année
          </button>
        </div>

        {/* Statistiques globales */}
        {habitStats.overall_completion_rate && (
          <div className="mb-10 bg-white rounded-xl p-5 shadow-sm border border-gray-100 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
            <h2 className="text-xl font-semibold mb-4">Taux de complétion global</h2>
            <div className="flex items-center">
              <div className="w-full h-4 bg-gray-200 rounded-full">
                <div 
                  className={`h-full rounded-full ${getCompletionColor(habitStats.overall_completion_rate)}`} 
                  style={{ width: `${habitStats.overall_completion_rate}%` }} 
                />
              </div>
              <span className="ml-4 text-lg font-semibold">{formatCompletionRate(habitStats.overall_completion_rate)}</span>
            </div>
          </div>
        )}

        {/* Liste des habitudes */}
        <section className="mb-10 animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Mes habitudes</h2>
            <button 
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800"
            >
              {showAddForm ? 'Annuler' : 'Ajouter une habitude'}
            </button>
          </div>

          {/* Formulaire d'ajout d'habitude */}
          {showAddForm && (
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom de l'habitude</label>
                  <input
                    type="text"
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    value={newHabit.name}
                    onChange={(e) => setNewHabit({...newHabit, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    value={newHabit.description}
                    onChange={(e) => setNewHabit({...newHabit, description: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fréquence</label>
                  <select
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    value={newHabit.frequency}
                    onChange={(e) => setNewHabit({...newHabit, frequency: e.target.value})}
                  >
                    <option value="daily">Quotidienne</option>
                    <option value="weekly">Hebdomadaire</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valeur cible</label>
                  <div className="flex">
                    <input
                      type="number"
                      min="1"
                      className="w-24 border border-gray-300 rounded-l-md px-3 py-2"
                      value={newHabit.target_value}
                      onChange={(e) => setNewHabit({...newHabit, target_value: parseInt(e.target.value)})}
                    />
                    <input
                      type="text"
                      placeholder="unité (ex: fois)"
                      className="flex-grow border border-gray-300 rounded-r-md px-3 py-2 border-l-0"
                      value={newHabit.unit}
                      onChange={(e) => setNewHabit({...newHabit, unit: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Couleur</label>
                  <input
                    type="color"
                    className="w-full h-10 p-0 border border-gray-300 rounded-md"
                    value={newHabit.color}
                    onChange={(e) => setNewHabit({...newHabit, color: e.target.value})}
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <button type="submit" className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800">
                  Enregistrer
                </button>
              </div>
            </form>
          )}

          {isLoading ? (
            <div className="p-10 flex justify-center">
              <div className="animate-spin w-8 h-8 border-4 border-black border-t-transparent rounded-full"></div>
            </div>
          ) : habits.length === 0 ? (
            <div className="bg-white p-10 rounded-xl shadow-sm border border-gray-100 text-center">
              <p className="text-gray-500">Vous n'avez pas encore d'habitudes. Commencez par en ajouter une !</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {habits.map(habit => {
                const habitStat = habitStats.habits?.find(h => h.habit_id === habit.id) || {};
                const completionRate = habitStat.completion_rate || 0;
                
                return (
                  <div 
                    key={habit.id} 
                    className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover-lift"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-lg font-semibold">{habit.name}</h3>
                        {habit.description && <p className="text-gray-500">{habit.description}</p>}
                      </div>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleLogHabit(habit.id)}
                          className="bg-black text-white px-3 py-1 rounded hover:bg-gray-800 text-sm"
                        >
                          Fait aujourd'hui
                        </button>
                        <button 
                          onClick={() => handleDeleteHabit(habit.id)} 
                          className="text-red-500 hover:text-red-700"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    
                    <div className="mb-2">
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-1">
                        <span>Progression {activePeriod === 'week' ? 'hebdomadaire' : activePeriod === 'month' ? 'mensuelle' : 'annuelle'}</span>
                        <span>{formatCompletionRate(completionRate)}</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full">
                        <div 
                          className={`h-full rounded-full ${getCompletionColor(completionRate)}`} 
                          style={{ width: `${completionRate}%` }} 
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">
                        Fréquence: {habit.frequency === 'daily' ? 'Quotidienne' : 'Hebdomadaire'}
                      </span>
                      {habitStat.current_streak > 0 && (
                        <span className="font-medium">
                          🔥 Série actuelle: {habitStat.current_streak} jour{habitStat.current_streak > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default HabitTracker; 