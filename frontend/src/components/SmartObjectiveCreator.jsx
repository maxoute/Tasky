import React, { useState } from 'react';
import { themeService } from '../services/api';

const SmartObjectiveCreator = ({ onObjectiveCreated }) => {
  const [objective, setObjective] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [createdObjective, setCreatedObjective] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!objective.trim()) {
      setError('Veuillez entrer un objectif');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      const result = await themeService.generateTasks(objective, true);
      setCreatedObjective(result);
      setObjective('');
      
      // Notifier le composant parent si nécessaire
      if (onObjectiveCreated) {
        onObjectiveCreated(result);
      }
    } catch (err) {
      console.error('Erreur lors de la création de l\'objectif SMART:', err);
      setError(err.response?.data?.error || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-2">Créer un objectif SMART</h2>
        <p className="text-gray-600 mb-4">
          Transformez vos objectifs généraux en objectifs SMART (Spécifiques, Mesurables, Atteignables, Réalistes, Temporels)
        </p>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded mb-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="objective" className="block text-sm font-medium text-gray-700 mb-1">
              Votre objectif
            </label>
            <input
              type="text"
              id="objective"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-black focus:border-black"
              placeholder="Ex: Perdre du poids, Apprendre le piano..."
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-800 transition-colors"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Création en cours...
              </span>
            ) : (
              'Créer mon objectif SMART'
            )}
          </button>
        </form>
      </div>

      {createdObjective && (
        <div className="border-t border-gray-100 p-6 bg-gray-50 animate-fadeIn">
          <h3 className="font-semibold text-lg mb-4">
            {createdObjective.smart_objective?.title || 'Objectif SMART créé'}
          </h3>
          
          <div className="space-y-3 mb-6">
            <div className="flex">
              <span className="font-semibold w-28">Spécifique:</span>
              <span className="text-gray-700">{createdObjective.smart_objective?.specific}</span>
            </div>
            <div className="flex">
              <span className="font-semibold w-28">Mesurable:</span>
              <span className="text-gray-700">{createdObjective.smart_objective?.measurable}</span>
            </div>
            <div className="flex">
              <span className="font-semibold w-28">Atteignable:</span>
              <span className="text-gray-700">{createdObjective.smart_objective?.achievable}</span>
            </div>
            <div className="flex">
              <span className="font-semibold w-28">Réaliste:</span>
              <span className="text-gray-700">{createdObjective.smart_objective?.realistic}</span>
            </div>
            <div className="flex">
              <span className="font-semibold w-28">Temporel:</span>
              <span className="text-gray-700">{createdObjective.smart_objective?.time_bound}</span>
            </div>
          </div>
          
          <h4 className="font-semibold mb-3">Plan d'action</h4>
          <div className="space-y-2">
            {createdObjective.tasks?.map((task, index) => (
              <div key={index} className="p-3 bg-white rounded border border-gray-200">
                <div className="flex items-start">
                  <div className="h-6 w-6 rounded-full bg-black text-white flex items-center justify-center text-sm mr-3">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{task.text}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {task.hashtags?.map((tag, i) => (
                        <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          #{tag}
                        </span>
                      ))}
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        {task.estimated_time}
                      </span>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        Échéance: {task.deadline}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartObjectiveCreator; 