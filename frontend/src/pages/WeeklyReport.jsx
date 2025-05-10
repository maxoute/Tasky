import React, { useState, useEffect } from 'react';
import { recommendationService } from '../services/api';

const WeeklyReport = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    message: '',
    statistics: {
      total_tasks: 0,
      completed_tasks: 0,
      pending_tasks: 0,
      completion_rate: 0,
      categories: {}
    },
    smart_objectives: []
  });

  useEffect(() => {
    const fetchWeeklyReview = async () => {
      try {
        setLoading(true);
        console.log("Appel API weekly-review...");
        const result = await recommendationService.getWeeklyReview();
        console.log("Résultat de l'API:", result);
        setData(result);
        setError(null);
      } catch (err) {
        console.error("Erreur lors du chargement de la revue hebdomadaire:", err);
        setError("Impossible de charger la revue hebdomadaire. Veuillez réessayer.");
      } finally {
        setLoading(false);
      }
    };

    fetchWeeklyReview();
  }, []);

  if (loading) {
    return (
      <div className="w-full max-w-6xl mx-auto py-8 px-4 md:px-6">
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-6xl mx-auto py-8 px-4 md:px-6">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { statistics = {}, message = '', smart_objectives = [] } = data || {};
  const categoriesArray = Object.entries((statistics?.categories || {})).map(([name, stats]) => ({
    name,
    ...stats
  }));

  return (
    <div className="w-full max-w-6xl mx-auto py-8 px-4 md:px-6">
      <header className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          Revue Hebdomadaire
        </h1>
        <p className="text-gray-500">
          Analyse détaillée de votre productivité cette semaine
        </p>
      </header>

      {/* Message d'analyse IA */}
      <div className="mb-8 bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <svg className="h-5 w-5 text-black mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            Analyse de la semaine
          </h2>
          <p className="text-gray-700 italic border-l-4 border-gray-200 pl-4 py-2">
            {message || "Aucune analyse disponible pour cette semaine."}
          </p>
        </div>
      </div>

      {/* Statistiques globales */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Statistiques globales</h2>
        <div className="weekly-stats bg-white rounded-xl shadow-md overflow-hidden p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="stat-item bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-gray-900">{statistics.total_tasks}</div>
              <div className="text-sm text-gray-500 mt-1">Total des tâches</div>
            </div>
            <div className="stat-item bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-black">{statistics.completed_tasks}</div>
              <div className="text-sm text-gray-500 mt-1">Tâches terminées</div>
            </div>
            <div className="stat-item bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-gray-600">{statistics.pending_tasks}</div>
              <div className="text-sm text-gray-500 mt-1">Tâches en cours</div>
            </div>
            <div className="stat-item bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-black">{statistics.completion_rate}%</div>
              <div className="text-sm text-gray-500 mt-1">Taux d'achèvement</div>
            </div>
          </div>
          
          <div className="mt-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-500">Progression globale</span>
              <span className="font-medium">{statistics.completion_rate}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-black transition-all duration-500"
                style={{ width: `${statistics.completion_rate}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance par catégorie */}
      {categoriesArray.length > 0 && (
        <div className="mb-8 bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Performance par catégorie</h2>
            <div className="categories-performance">
              {categoriesArray.map((category) => (
                <div key={category.name} className="category-progress">
                  <div className="category-header">
                    <span className="category-name">#{category.name}</span>
                    <span className="font-medium">{category.completion_rate}%</span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${category.completion_rate}%`, backgroundColor: category.completion_rate > 75 ? '#000000' : category.completion_rate > 50 ? '#404040' : category.completion_rate > 25 ? '#606060' : '#808080' }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{category.completed}/{category.total} tâches</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Objectifs SMART */}
      {smart_objectives.length > 0 && (
        <div className="mb-8 bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Objectifs SMART en cours</h2>
            <div className="space-y-4">
              {smart_objectives.map((objective, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-lg mb-2">{objective.title || `Objectif: ${objective.theme}`}</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li><span className="font-medium">Spécifique:</span> {objective.specific}</li>
                    <li><span className="font-medium">Mesurable:</span> {objective.measurable}</li>
                    <li><span className="font-medium">Atteignable:</span> {objective.achievable}</li>
                    <li><span className="font-medium">Réaliste:</span> {objective.realistic}</li>
                    <li><span className="font-medium">Temporel:</span> {objective.time_bound}</li>
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default WeeklyReport; 