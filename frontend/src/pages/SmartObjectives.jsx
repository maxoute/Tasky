import React, { useState, useEffect } from 'react';
import { recommendationService } from '../services/api';
import SmartObjectiveCreator from '../components/SmartObjectiveCreator';

const SmartObjectives = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [objectives, setObjectives] = useState([]);
  const [selectedObjective, setSelectedObjective] = useState(null);

  useEffect(() => {
    fetchObjectives();
  }, []);

  const fetchObjectives = async () => {
    try {
      setLoading(true);
      // On utilise le service de recommendations pour récupérer les objectifs SMART
      const data = await recommendationService.getWeeklyReview();
      if (data && data.smart_objectives) {
        setObjectives(data.smart_objectives);
      }
      setError(null);
    } catch (err) {
      console.error("Erreur lors du chargement des objectifs SMART:", err);
      setError("Impossible de charger les objectifs SMART. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  const handleObjectiveCreated = (newObjective) => {
    // Actualiser la liste des objectifs
    fetchObjectives();
  };

  return (
    <div className="w-full max-w-6xl mx-auto py-8 px-4 md:px-6">
      <header className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          Objectifs SMART
        </h1>
        <p className="text-gray-500">
          Définissez et suivez vos objectifs avec une méthodologie éprouvée
        </p>
      </header>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded mb-6">
          <p className="text-sm font-medium text-red-800">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne de gauche - Créateur d'objectifs */}
        <div className="lg:col-span-1">
          <SmartObjectiveCreator onObjectiveCreated={handleObjectiveCreated} />
        </div>

        {/* Colonne de droite - Liste des objectifs */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold mb-4">Mes objectifs en cours</h2>
            
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
              </div>
            ) : objectives.length > 0 ? (
              <div className="space-y-4">
                {objectives.map((objective, index) => (
                  <div 
                    key={index}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => setSelectedObjective(objective)}
                  >
                    <h3 className="font-medium text-lg">{objective.title}</h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="text-xs bg-black text-white px-2 py-1 rounded-full">
                        {objective.time_bound}
                      </span>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                        {objective.measurable}
                      </span>
                    </div>
                    <p className="text-gray-600 mt-2 line-clamp-2">{objective.specific}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                <p className="mt-2">Aucun objectif SMART trouvé</p>
                <p className="mt-1">Créez votre premier objectif avec le formulaire à gauche</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de détails d'un objectif */}
      {selectedObjective && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <h2 className="text-2xl font-bold">{selectedObjective.title}</h2>
                <button 
                  onClick={() => setSelectedObjective(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="mt-6 space-y-4">
                <div>
                  <h3 className="font-semibold">Spécifique</h3>
                  <p className="text-gray-700">{selectedObjective.specific}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Mesurable</h3>
                  <p className="text-gray-700">{selectedObjective.measurable}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Atteignable</h3>
                  <p className="text-gray-700">{selectedObjective.achievable}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Réaliste</h3>
                  <p className="text-gray-700">{selectedObjective.realistic}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Temporel</h3>
                  <p className="text-gray-700">{selectedObjective.time_bound}</p>
                </div>
              </div>
              
              <div className="mt-8">
                <button
                  onClick={() => setSelectedObjective(null)}
                  className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartObjectives;